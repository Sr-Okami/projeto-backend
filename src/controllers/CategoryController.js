const { Category } = require('../models');
const { Op, where } = require('sequelize');

class CategoryController {

    async index(req, res) {
        try {
            const {
                limit = 12,
                page = 1,
                filds,
                use_in_menu
            } = req.query;

            const limitNum = parseInt(limit);
            const pageNum = parseInt(page);

            let queryOptions = {
                where: {}
            };

            //Filtro use_in_menu
            if (use_in_menu !== undefined) {
                queryOptions.where.use_in_menu = use_in_menu === 'true';
            } 

            // Campos especificos
            if (filds) {
                queryOptions.attributes = filds.split(',');
            }


            // Paginação
            if (limitNum !== -1) {
                queryOptions.limit = limitNum;
                queryOptions.offset = (pageNum - 1) * limitNum;
            }

            const { count, rows } = await Category.findAndCountAll(queryOptions);

            res.json({
                data: rows,
                total: count,
                page: pageNum,
                limit: limitNum
            });
        } 
        catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }

    // (Get) Listar uma categoria
    async show(req, res) {
        try {
            const category = await Category.findByPk(req.params.id);

            if (!category) {
                return res.status(404).json({ error: 'Categoria não encontrada.' });
            }

            res.json(category);
        } 
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // (Post) Criar uma categoria
    async store(req, res) {
        try {
            const { name, slug, use_in_menu } = req.body;

            // Validar campos obrigatórios
            if (!name || !slug) {
                return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
            }

            await Category.create({ name, slug, use_in_menu });

            res.status(201).json({ message: 'Categoria criada.' });
        } 
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    // (Put) Atualizar uma categoria
    async update(req, res) {
        try {
            const { name, slug, use_in_menu } = req.body;
            const category = await Category.findByPk(req.params.id);

            if (!category) {
                return res.status(404).json({ error: 'Categoria não existe.' });
            }

            await category.update({ name, slug, use_in_menu });
            res.status(204).send();
        } 
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // (Delete) Deletar uma categoria
    async delete(req, res) {
        try {
            const category = await Category.findByPk(req.params.id);

            if (!category) {
                return res.status(404).json({ error: 'Categoria não encontrada.' });
            }

            await category.destroy();
            res.status(204).send();
        } 
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }          
}

module.exports = new CategoryController();