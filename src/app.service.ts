import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Desafio } from './interfaces/desafio.interface';
import { Jogador } from './interfaces/jogador.interface';
import { ClientProxySmartRanking } from './proxyrmq/client-proxy';
import HTML_NOTIFICACAO_ADVERSARIO from './static/html-notificacao-adversario';

@Injectable()
export class AppService {
  constructor(private clientProxySmartRanking: ClientProxySmartRanking, private readonly mailService: MailerService) { }

  private readonly logger = new Logger(AppService.name);
  private cleintAdminBackend = this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

  async EnviarEmailParaAdversario(desafio: Desafio): Promise<void> {
    try {
      let idAdversario = ''

      desafio.jogadores.map(jogador => {

        if (jogador !== desafio.solicitante) {
          idAdversario = jogador
        }

      });
      const adversario = await this.cleintAdminBackend.send('consultar-jogadores', idAdversario).toPromise();
      const solicitante: Jogador = await this.cleintAdminBackend.send('consultar-jogadores', desafio.solicitante).toPromise();

      let markup = ''
      markup = HTML_NOTIFICACAO_ADVERSARIO;
      markup = markup.replace(/#NOME_ADVERSARIO/g, adversario.nome)
      markup = markup.replace(/#NOME_SOLICITANTE/g, solicitante.nome)

      this.mailService.sendMail({
        to: adversario.email,
        from: `"SMART RANKING" <api.smartranking@gmail.com.br>`,
        subject: 'Notificação de Desafio',
        html: markup,
      }).then((sucess) => {
        this.logger.log(sucess);
      }).catch((err) => {
        this.logger.error(err);
      })

    } catch (error) {


      this.logger.error(`Error: ${JSON.stringify(error)}`)
      throw new RpcException(error.message)
    }
  }

}
