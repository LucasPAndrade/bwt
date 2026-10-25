import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import activation from "models/activation.js";

const router = new createRouter();

router.use(controller.injectAnonymousOrUser); //Middleware `injectAnonymousOrUser` injects either an anonymous user or an authenticated user into the request context, based on the session cookie
router.post(controller.canRequest("create:user"), postHandler); //Middleware `canRequest` checks if the user has the required feature to read session information

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;
  const newUser = await user.create(userInputValues);

  const activationToken = await activation.create(newUser.id);
  await activation.sendActivationEmail(newUser, activationToken);

  return response.status(201).json(newUser);
}
