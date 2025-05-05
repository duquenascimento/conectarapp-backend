import { type FastifyInstance } from "fastify";
import {
  save,
  del,
  type ISaveFavoriteRequest,
  type IDeleteFavoriteRequest,
  list,
  type IListFavorite,
  type IUpdateFavorite,
  update,
  IUpdateFavoriteRequest,
} from "../service/favoriteService";

export const favoriteRoute = async (server: FastifyInstance): Promise<void> => {
  server.post("/favorite/save", async (req, res): Promise<any> => {
    try {
      const result = await save(req.body as ISaveFavoriteRequest);
      if (result == null) throw Error(process.env.INTERNAL_ERROR_MSG);
      return await res.status(200).send({
        status: 200,
        data: result.data,
      });
    } catch (err) {
      const message = (err as Error).message;
      if (message === process.env.INTERNAL_ERROR_MSG) {
        await res.status(500).send({
          status: 500,
          msg: message,
        });
      } else {
        await res.status(409).send({
          status: 200,
          msg: message,
        });
        console.log(message);
      }
    }
  });

  server.post("/favorite/update", async (req, res): Promise<any> => {
    try {
      const result = await update(req.body as IUpdateFavoriteRequest);
      if (result == null) throw Error(process.env.INTERNAL_ERROR_MSG);
      return await res.status(200).send({
        status: 200,
        data: result,
      });
    } catch (err) {
      const message = (err as Error).message;
      if (message === process.env.INTERNAL_ERROR_MSG) {
        await res.status(500).send({
          status: 500,
          msg: message,
        });
      } else {
        await res.status(409).send({
          status: 200,
          msg: message,
        });
        console.log(message);
      }
    }
  });

  server.post("/favorite/del", async (req, res): Promise<any> => {
    try {
      const result = await del(req.body as IDeleteFavoriteRequest);
      if (result == null) throw Error(process.env.INTERNAL_ERROR_MSG);
      return await res.status(200).send({
        status: 200,
        data: result.data,
      });
    } catch (err) {
      const message = (err as Error).message;
      if (message === process.env.INTERNAL_ERROR_MSG) {
        await res.status(500).send({
          status: 500,
          msg: message,
        });
      } else {
        await res.status(409).send({
          status: 200,
          msg: message,
        });
      }
    }
  });

  server.post("/favorite/list", async (req, res): Promise<any> => {
    try {
      const result = await list(req.body as IListFavorite);
      if (result == null) throw Error(process.env.INTERNAL_ERROR_MSG);
      return await res.status(200).send({
        status: 200,
        data: result,
      });
    } catch (err) {
      const message = (err as Error).message;
      if (message === process.env.INTERNAL_ERROR_MSG) {
        await res.status(500).send({
          status: 500,
          msg: message,
        });
      } else {
        await res.status(409).send({
          status: 200,
          msg: message,
        });
      }
    }
  });
};
