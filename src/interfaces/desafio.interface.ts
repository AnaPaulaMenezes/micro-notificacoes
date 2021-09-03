import { DesafioStatus } from "src/enum-status.enum";


export interface Desafio {
    dataHoraDesafio: Date;
    status: DesafioStatus;
    dataHoraSolicitacao: Date;
    dataHoraResposta?: Date;
    solicitante: string;
    categoria: string;
    jogadores: string[]
    partida?: string;
}



