function qualquerNome(request, response) {
  // response.status(200).send("Minha resposta (são é olá)");
  response.status(200).json({ chave: "Minha resposta (são é olá) aa" });
}

export default qualquerNome;
