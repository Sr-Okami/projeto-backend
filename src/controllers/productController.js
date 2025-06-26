const { Product, ProductImage, ProductOption, ProductCategory, Category } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');

class ProductController {
  // (GET) Listar produtos
  async index(req, res) {
    try {
      const { 
        limit = 12, 
        page = 1, 
        fields, 
        match,
        category_ids,
        options = [],
        'price-range': priceRange,

      } = req.query;

      const limitNum = parseInt(limit);
      const pageNum = parseInt(page);
      
      let queryOptions = {
        where: {},
        include: [
          {
            model: ProductImage,
            as: 'images',
            attributes: ['id', 'path'],
            where: { enabled: true },
            required: false
          },
          {
            model: ProductOption,
            as: 'options',
            required: false
          },
          {
            model: Category,
            as: 'categories',
            attributes: ['id'],
            through: { attributes: [] },
            required: false
          }
        ]
      };

      // Filtro por texto (nome ou descrição)
      if (match) {
        queryOptions.where[Op.or] = [
          { name: { [Op.like]: `%${match}%` } },
          { description: { [Op.like]: `%${match}%` } }
        ];
      }

      // Filtro de preços 
      if (priceRange) {
        const [minPrice, maxPrice] = priceRange.split('-').map(Number);
        if (minPrice && maxPrice) {
          queryOptions.where.price = {
            [Op.between]: [minPrice, maxPrice]
          };
        }
      }

      // Filtro de categorias
      if (category_ids) {
        const categoryIds = category_ids.split(',').map(Number);
        queryOptions.include.push({
          model: ProductCategory,
          where: { category_id: { [Op.in]: categoryIds } },
          required: true,
          attributes: []
        });
      }

      // Filtro de opções de produto
      Object.keys(options).forEach(key => {
        if (key.startsWith('option[') && key.endsWith(']')) {
          const optionId = key.match(/\[(\d+)\]/)[1];
          const values = req.query[key].split(',');
          
          queryOptions.include.push({
            model: ProductOption,
            where: {
              id: optionId,
              values: {
                [Op.or]: values.map(value => ({ [Op.like]: `%${value}%` }))
              }
            },
            required: true,
            attributes: []
          });
        }
      });

      // Campos
      if (fields) {
        const allowedFields = fields.split(',');
        queryOptions.attributes = ['id', ...allowedFields];
      }

      // para a paginação
      if (limitNum !== -1) {
        queryOptions.limit = limitNum;
        queryOptions.offset = (pageNum - 1) * limitNum;
      }

      const { count, rows } = await Product.findAndCountAll(queryOptions);

      // Formatar resposta
      const formattedProducts = rows.map(product => {
        const productData = product.toJSON();
        
        // Adicionar category_ids
        productData.category_ids = productData.categories ? 
          productData.categories.map(cat => cat.id) : [];
        
        // Formatar imagens
        if (productData.images) {
          productData.images = productData.images.map(img => ({
            id: img.id,
            content: `${req.protocol}://${req.get('host')}/uploads/${img.path}`
          }));
        }
        
        // Remover categories se não foi solicitado
        if (fields && !fields.includes('categories')) {
          delete productData.categories;
        }
        
        return productData;
      });

      res.json({
        data: formattedProducts,
        total: count,
        limit: limitNum,
        page: pageNum
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // GET /v1/product/:id
  async show(req, res) {
    try {
      const product = await Product.findByPk(req.params.id, {
        include: [
          {
            model: ProductImage,
            as: 'images',
            attributes: ['id', 'path'],
            where: { enabled: true },
            required: false
          },
          {
            model: ProductOption,
            as: 'options',
            required: false
          },
          {
            model: Category,
            as: 'categories',
            attributes: ['id'],
            through: { attributes: [] },
            required: false
          }
        ]
      });

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      const productData = product.toJSON();
      
      // Adicionar category_ids
      productData.category_ids = productData.categories ? 
        productData.categories.map(cat => cat.id) : [];
      
      // Formatar imagens
      if (productData.images) {
        productData.images = productData.images.map(img => ({
          id: img.id,
          content: `${req.protocol}://${req.get('host')}/uploads/${img.path}`
        }));
      }

      delete productData.categories;

      res.json(productData);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // POST /v1/product
  async store(req, res) {
    try {
      const {
        enabled,
        name,
        slug,
        use_in_menu,
        stock,
        description,
        price,
        price_with_discount,
        category_ids,
        images,
        options
      } = req.body;

      // Validações básicas
      if (!name || !slug || !price || price_with_discount === undefined) {
        return res.status(400).json({ 
          error: 'Nome, slug, preço e preço com desconto são obrigatórios' 
        });
      }

      // Criar produto
      const product = await Product.create({
        enabled: enabled || false,
        name,
        slug,
        use_in_menu: use_in_menu || false,
        stock: stock || 0,
        description,
        price,
        price_with_discount
      });

      // Associar categorias
      if (category_ids && category_ids.length > 0) {
        const categoryAssociations = category_ids.map(categoryId => ({
          product_id: product.id,
          category_id: categoryId
        }));
        await ProductCategory.bulkCreate(categoryAssociations);
      }

      // Processar imagens
      if (images && images.length > 0) {
        await this.processImages(images, product.id);
      }

      // Processar opções
      if (options && options.length > 0) {
        await this.processOptions(options, product.id);
      }

      res.status(201).json({ message: 'Produto criado com sucesso' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // PUT /v1/product/:id
  async update(req, res) {
    try {
      const {
        enabled,
        name,
        slug,
        use_in_menu,
        stock,
        description,
        price,
        price_with_discount,
        category_ids,
        images,
        options
      } = req.body;

      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      // Atualizar dados básicos do produto
      await product.update({
        enabled,
        name,
        slug,
        use_in_menu,
        stock,
        description,
        price,
        price_with_discount
      });

      // Atualizar categorias
      if (category_ids) {
        await ProductCategory.destroy({ where: { product_id: product.id } });
        if (category_ids.length > 0) {
          const categoryAssociations = category_ids.map(categoryId => ({
            product_id: product.id,
            category_id: categoryId
          }));
          await ProductCategory.bulkCreate(categoryAssociations);
        }
      }

      // Atualizar imagens
      if (images) {
        await this.updateImages(images, product.id);
      }

      // Atualizar opções
      if (options) {
        await this.updateOptions(options, product.id);
      }

      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // DELETE /v1/product/:id
  async delete(req, res) {
    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      // Deletar associações
      await ProductCategory.destroy({ where: { product_id: product.id } });
      
      // Deletar imagens do sistema de arquivos
      const images = await ProductImage.findAll({ where: { product_id: product.id } });
      for (const image of images) {
        try {
          await fs.unlink(path.join(__dirname, '../../uploads', image.path));
        } catch (err) {
          console.log('Erro ao deletar imagem:', err.message);
        }
      }
      
      await ProductImage.destroy({ where: { product_id: product.id } });
      await ProductOption.destroy({ where: { product_id: product.id } });
      
      // Deletar produto
      await product.destroy();

      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Método auxiliar para processar imagens
  async processImages(images, productId) {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Criar diretório se não existir
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    for (const image of images) {
      if (image.content && image.type) {
        // Decodificar base64
        const base64Data = image.content.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Gerar nome único para o arquivo
        const extension = image.type.split('/')[1];
        const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${extension}`;
        const filepath = path.join(uploadDir, filename);
        
        // Salvar arquivo
        await fs.writeFile(filepath, buffer);
        
        // Salvar no banco
        await ProductImage.create({
          product_id: productId,
          enabled: true,
          path: filename
        });
      }
    }
  }

  // Método auxiliar para atualizar imagens
  async updateImages(images, productId) {
    for (const image of images) {
      if (image.id && image.deleted) {
        // Deletar imagem existente
        const existingImage = await ProductImage.findByPk(image.id);
        if (existingImage) {
          try {
            await fs.unlink(path.join(__dirname, '../../uploads', existingImage.path));
          } catch (err) {
            console.log('Erro ao deletar imagem:', err.message);
          }
          await existingImage.destroy();
        }
      } else if (image.id && image.content) {
        // Atualizar imagem existente
        if (image.content.startsWith('data:image')) {
          // Nova imagem em base64
          const base64Data = image.content.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          
          const existingImage = await ProductImage.findByPk(image.id);
          if (existingImage) {
            // Deletar arquivo antigo
            try {
              await fs.unlink(path.join(__dirname, '../../uploads', existingImage.path));
            } catch (err) {
              console.log('Erro ao deletar imagem antiga:', err.message);
            }
            
            // Salvar nova imagem
            const extension = 'jpg'; // Assumir jpg se não especificado
            const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${extension}`;
            const filepath = path.join(__dirname, '../../uploads', filename);
            
            await fs.writeFile(filepath, buffer);
            await existingImage.update({ path: filename });
          }
        }
      } else if (!image.id && image.content && image.type) {
        // Nova imagem
        await this.processImages([image], productId);
      }
    }
  }

  // Método auxiliar para processar opções
  async processOptions(options, productId) {
    for (const option of options) {
      const valuesString = Array.isArray(option.values) ? 
        option.values.join(',') : option.values;
        
      await ProductOption.create({
        product_id: productId,
        title: option.title,
        shape: option.shape || 'square',
        radius: option.radius || 0,
        type: option.type || 'text',
        values: valuesString
      });
    }
  }

  // Método auxiliar para atualizar opções
  async updateOptions(options, productId) {
    for (const option of options) {
      if (option.id && option.deleted) {
        // Deletar opção existente
        await ProductOption.destroy({ where: { id: option.id } });
      } else if (option.id) {
        // Atualizar opção existente
        const existingOption = await ProductOption.findByPk(option.id);
        if (existingOption) {
          const valuesString = Array.isArray(option.values) ? 
            option.values.join(',') : option.values;
            
          await existingOption.update({
            title: option.title || existingOption.title,
            shape: option.shape || existingOption.shape,
            radius: option.radius !== undefined ? option.radius : existingOption.radius,
            type: option.type || existingOption.type,
            values: valuesString || existingOption.values
          });
        }
      } else if (!option.id) {
        // Nova opção
        await this.processOptions([option], productId);
      }
    }
  }
}

module.exports = new ProductController();