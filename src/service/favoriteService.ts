import {
  saveFavorite,
  deleteFavorite,
  findByProductAndUser,
  listByUser,
} from "../repository/favoriteRepository";
import { logRegister } from "../utils/logUtils";
import { v4 as uuidv4 } from "uuid";
import { decode } from "jsonwebtoken";
import { ApiRepository } from "../repository/apiRepository";

const apiRepository = new ApiRepository(process.env.URL_API_ANTIGA ?? "");

export interface ISaveFavoriteRequest {
  token: string;
  productId: string;
  restaurantId: string; //adicionado id do restaurante a salvar o favorito
}

export interface ISaveFavorite {
  id: string;
  productId: string;
  restaurantId: string;
}

export const save = async (req: ISaveFavoriteRequest): Promise<any> => {
  try {
    if (req.token == null)
      throw Error("missing token", { cause: "visibleError" });
    const decoded = decode(req.token) as { id: string };
    const request: ISaveFavorite = {
      id: uuidv4(),
      productId: req.productId,
      restaurantId: req.restaurantId,
    };
    const result = await findByProductAndUser(request);
    if (result != null) return null;
    await saveFavorite(request);
    return true;
  } catch (err) {
    if ((err as any).cause !== "visibleError") await logRegister(err);
    throw Error((err as Error).message);
  }
};

export interface IDeleteFavoriteRequest {
  productId: string;
  token: string;
}

export interface IDeleteFavorite {
  productId: string;
  restaurantId: string;
}

export const del = async (req: IDeleteFavoriteRequest): Promise<any> => {
  try {
    if (req.token == null)
      throw Error("missing token", { cause: "visibleError" });
    const decoded = decode(req.token) as { id: string };
    const request: IDeleteFavorite = {
      productId: req.productId,
      restaurantId: decoded.id,
    };
    const result = await findByProductAndUser(request as ISaveFavorite);
    if (result == null) return null;
    await deleteFavorite(result.id);
    return true;
  } catch (err) {
    if ((err as any).cause !== "visibleError") await logRegister(err);
    throw Error((err as Error).message);
  }
};

export interface IListFavorite {
  token: string;
}

export const list = async (req: IListFavorite): Promise<any> => {
  try {
    if (req.token == null)
      throw Error("missing token", { cause: "visibleError" });
    const decoded = decode(req.token) as { id: string };
    const result = await listByUser(decoded.id);

    const raw = JSON.stringify({
      ids: result?.map((item) => item.productId),
    });

    const response = await apiRepository.callApi(
      "/listFavoriteProductToApp",
      "POST",
      raw
    );

    if (!response?.data || !Array.isArray(response.data)) {
      throw new Error("Resposta da API inválida");
    }

    // Filtrar os itens com active: true
    const filteredData = response.data.filter(
      (item: any) => item.active === true
    );

    return filteredData;
  } catch (err) {
    if ((err as any).cause !== "visibleError") await logRegister(err);
    throw Error((err as Error).message);
  }
};
