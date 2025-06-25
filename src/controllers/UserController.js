const { User } = require('../models');
const jwt = require('jsonwebtoken');

class UserController {
    // Listar usuários (Get)
    async show(req, res) {
        try {
            const user = await User.findByPk(req.params.id, {
                attributes: [ 'id', 'firstname', 'surname', 'email']
            });

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            res.json(user);
        } 
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Criar usuário (Post)
    async store(req, res) {
        try {
            const { firstname, surname, email, password, confirmPassword } = req.body;

            // Validar campos obrigatórios
            if (!firstname || !surname || !email || !password) {
                return res.status(400).json({ error: 'Preencha todos os campos.' });
            }
            // Verifica se as senhas são iguais
            if (password !== confirmPassword) {
                return res.status(400).json({ error: 'As senhas devem ser iguais.' });
            }

            // Verificar se o email já está cadastrado
            const existingUser = await User.findOne({ where: { email } });

            if (existingUser) {
                return res.status(400).json({ error: 'Email já cadastrado.' });
            }

            // Criar usuário
            const user = await User.create({ firstname, surname, email, password });

            res.status(201).json({ message: 'Usuário foi criado com sucesso.', user });
        } 
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Atualizar usuário (Put)
    async update(req, res) {
        try {
            const { firstname, surname, email } = req.body;
            const user = await User.findByPk(req.params.id);

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            await user.update({ firstname, surname, email });
            res.status(204).send();
        } 
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    // Deletar usuário (Delete)
    async delete(req, res) {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await user.destroy();
      res.status(204).send();
    } 
    catch (error) {
      res.status(400).json({ error: error.message });
    }
    }

    // Gerar token (Post)
    async generateToken(req, res) {
        try {
            const {email, password} = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
            }

            const user = await User.findOne({ where: { email } });

            if (!user || !(await user.validatePassword(password))) {
                return res.status(404).json({ error: 'Usuário ou senha incorretos.' });
            }

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d'
            });

            res.json({ token });
            } 
                catch (error) {
                res.status(500).json({ error: error.message });
            }
        }
    }

module.exports = new UserController();