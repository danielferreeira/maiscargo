import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User.js';
import authConfig from '../config/auth.js';

class AuthController {
  async login(req, res) {
    try {
      console.log('Iniciando processo de login...');
      console.log('Dados recebidos:', req.body);

      const schema = Yup.object().shape({
        email: Yup.string().email().required(),
        password: Yup.string().required(),
      });

      if (!(await schema.isValid(req.body))) {
        console.log('Falha na validação do schema');
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
      }

      const { email, password } = req.body;

      console.log('Buscando usuário no banco de dados...');
      const user = await User.findOne({ 
        where: { email },
        attributes: ['id', 'name', 'email', 'password_hash', 'type', 'status']
      });

      if (!user) {
        console.log('Usuário não encontrado');
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      console.log('Verificando senha...');
      const passwordValid = await user.checkPassword(password);
      if (!passwordValid) {
        console.log('Senha incorreta');
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      const { id, name, type } = user;

      console.log('Gerando token...');
      const token = jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      });

      console.log('Login realizado com sucesso');
      return res.json({
        user: {
          id,
          name,
          email,
          type,
        },
        token,
      });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async register(req, res) {
    try {
      console.log('Iniciando registro de usuário...');
      console.log('Dados recebidos:', req.body);

      // Validação apenas dos campos obrigatórios
      const schema = Yup.object().shape({
        name: Yup.string().required('Nome é obrigatório'),
        email: Yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
        password: Yup.string().required('Senha é obrigatória').min(6, 'Senha deve ter no mínimo 6 caracteres'),
        type: Yup.string().oneOf(['transportador', 'embarcador'], 'Tipo inválido').required('Tipo é obrigatório'),
        document: Yup.string()
          .required('Documento é obrigatório')
          .test('document', 'Documento inválido', function(value) {
            if (!value) return false;
            const cleanDoc = value.replace(/\D/g, '');
            const isTransportador = this.parent.type === 'transportador';
            // Se for transportador, aceita CPF (11 dígitos) ou CNPJ (14 dígitos)
            // Se for embarcador, aceita apenas CNPJ (14 dígitos)
            if (isTransportador) {
              return cleanDoc.length === 11 || cleanDoc.length === 14;
            }
            return cleanDoc.length === 14;
          }),
        phone: Yup.string()
          .required('Telefone é obrigatório')
          .test('phone', 'Telefone inválido', value => {
            if (!value) return false;
            const cleanPhone = value.replace(/\D/g, '');
            return cleanPhone.length >= 10 && cleanPhone.length <= 11;
          })
      });

      try {
        await schema.validate(req.body, { abortEarly: false });
      } catch (validationError) {
        console.log('Erro de validação:', validationError.errors);
        return res.status(400).json({
          error: 'Erro de validação',
          details: validationError.inner.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }

      const userExists = await User.findOne({ where: { email: req.body.email } });

      if (userExists) {
        return res.status(400).json({ error: 'E-mail já cadastrado' });
      }

      // Limpar caracteres especiais do documento e telefone
      const document = req.body.document.replace(/\D/g, '');
      const phone = req.body.phone.replace(/\D/g, '');

      // Criar usuário com campos obrigatórios
      const userData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        type: req.body.type,
        document,
        phone,
        status: 'ativo'
      };

      console.log('Criando novo usuário:', userData);
      const user = await User.create(userData);

      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        status: user.status
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Erro de validação',
          details: error.errors.map(err => ({
            field: err.path,
            message: err.message
          }))
        });
      }
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }
}

export default new AuthController(); 