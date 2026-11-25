import type {PreferenceRequest} from "mercadopago";

import {MercadoPagoConfig, Preference, Payment} from "mercadopago";

const mercadopago = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN!});

const api = {
  prepare: async (body: PreferenceRequest) => {
    const preference = await new Preference(mercadopago).create({body});

    return preference.init_point!;
  },
  validate: async (id: string) => {
    await new Payment(mercadopago).get({id});
  },
};

export default api;
