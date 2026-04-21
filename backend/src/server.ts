import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
  console.log(`Endpoints disponíveis em: http://localhost:${PORT}/funcionarios`);
});
