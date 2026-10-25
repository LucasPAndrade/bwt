import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import activation from "models/activation.js";

const router = new createRouter();

router.use(controller.injectAnonymousOrUser); //Middleware `injectAnonymousOrUser` injects either an anonymous user or an authenticated user into the request context, based on the session cookie
router.patch(controller.canRequest("read:activation_token"), patchHandler); //Middleware `canRequest` checks if the user has the required feature to read session information

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const activationTokenId = request.query.token_id;

  //TO-DO: Put all the following logic in a single transaction to avoid race conditions and ensure atomicity
  const validActivationToken =
    await activation.findOneValidById(activationTokenId);

  await activation.activateUserByUserId(validActivationToken.user_id);

  const usedActivationToken =
    await activation.markTokenAsUsed(activationTokenId);

  return response.status(200).json(usedActivationToken);
}
