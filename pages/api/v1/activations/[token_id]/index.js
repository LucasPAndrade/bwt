import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import activation from "models/activation.js";

const router = new createRouter();
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const activationTokenId = request.query.token_id;

  //TO-DO: Put all the following logic in a single transaction to avoid race conditions and ensure atomicity
  const validActivationToken =
    await activation.findOneValidById(activationTokenId);
  const usedActivationToken =
    await activation.markTokenAsUsed(activationTokenId);

  await activation.activateUserByUserId(validActivationToken.user_id);

  return response.status(200).json(usedActivationToken);
}
