export const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? `http://${window.location.hostname}:8000/api` 
  : `http://${window.location.hostname}:8000/api`;

// Se estiver rodando dentro do Docker e acessando pelo IP do host, 
// o window.location.hostname já deve ser o IP correto.
