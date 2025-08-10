export interface Escola {
  id: string;
  nome: string;
  createdAt: string;
}

export interface Turma {
  id: string;
  nome: string;
  disciplina: string;
  escolaId: string;
  alunoIds: string[];
  createdAt: string;
}

export interface Aluno {
  id: string;
  nome: string;
  fotoPath?: string;
  createdAt: string;
}

export interface Horario {
  id: string;
  turmaId: string;
  diaDaSemana: number; // 1 for Monday, 7 for Sunday
  horaInicio: string; // "HH:mm"
  horaFim: string; // "HH:mm"
  createdAt: string;
}

export interface Chamada {
  id: string; // composite key: alunoId_turmaId_data
  alunoId: string;
  turmaId: string;
  data: string; // "YYYY-MM-DD"
  presente: boolean;
  observacao?: string;
  createdAt: string;
}

export interface ConteudoAula {
  id: string;
  turmaId: string;
  data: string; // "YYYY-MM-DD"
  conteudo: string;
  fotosPath: string[];
  createdAt: string;
}

export interface Disciplina {
  id: string;
  nome: string;
  createdAt: string;
}

export interface Materia {
  id: string;
  nome: string;
  disciplinaId: string;
  arquivosPath: string[];
  createdAt: string;
}