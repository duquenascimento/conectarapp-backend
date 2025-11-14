import { receiptErrorMessage } from './slackUtils';
import { logRegister } from './logUtils';

export interface ConfirmOrderTemplateData {
  id_pedido: string;
  restaurante: string;
  nome: string;
  razao_social: string;
  cnpj: string;
  data_entrega: string;
  horario_maximo: string;
  horario_minimo: string;
  total_conectar: string;
  total_em_descontos: string;
  total_sem_descontos: string;
  bairro: string;
  cep: string;
  cidade: string;
  informacao_de_entrega: string;
  inscricao_estadual: string;
  complemento: string;
  resp_recebimento: string;
  rua: string;
  tel_resp_recebimento: string;
  id_cliente: Array<{
    cnpj: string;
    razao_social: string;
    nome: string;
  }>;
  detalhamento_pedido: Array<{
    aux_obs: string;
    custo_unidade_conectar: string;
    exibir_para_cliente: string;
    preco_final_conectar: string;
    qtd_final_cliente: string;
    qtd_pedido: string;
    unidade_cotacao: string;
    unidade_pedido: string;
    produto_descricao: string;
  }>;
  cnpj_fornecedor: string;
  codigo_carteira: string;
  data_emissao: string;
  data_pedido: string;
  data_vencimento: string;
  id_beneficiario: string;
  identificador_calculado: string;
  nome_bairro: string;
  nome_cidade: string;
  nome_logradouro: string;
  numero_cep: string;
  numero_linha_digitavel: string;
  numero_nosso_numero: string;
  sigla_UF: string;
  cliente_com_boleto: string;
  nome_cliente: string;
  id_distribuidor: string;
}

const BASE_URL = 'https://api.documint.me/1';
const API_KEY = process.env.DOCUMINT_KEY ?? '';

export async function sendConfirmOrderTemplate(
  restaurantExternalId: string,
  body: ConfirmOrderTemplateData,
): Promise<Response | null> {
  const url = `${BASE_URL}/templates/66c89d6350bcff4eb423c34f/content?preview=true&active=true`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        api_key: API_KEY,
      },
      body: JSON.stringify({ body }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      await receiptErrorMessage(restaurantExternalId);
      logRegister(new Error(`Documint request failed: ${response.status} ${text}`));
    }

    return response;
  } catch (err) {
    await receiptErrorMessage(restaurantExternalId);
    logRegister(err as Error);
    return null;
  }
}
