import { authenticator } from "otplib";

// aceita o codigo anterior e o proximo tambem (30s pra cada lado), por causa do relogio do celular
authenticator.options = { window: 1 };

export { authenticator };
