import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import session from "models/session";

const router = createRouter();

router.use(controller.injectAnonymousOrUser); //Middleware `injectAnonymousOrUser` injects either an anonymous user or an authenticated user into the request context, based on the session cookie
router.get(controller.canRequest("read:session"), getHandler); //Middleware `canRequest` checks if the user has the required feature to read session information

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const sessionToken = request.cookies.session_id;

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const userFound = await user.findOneById(sessionObject.user_id);

  const renewedSessionObject = await session.renew(sessionObject.id);

  controller.setSessionCookie(renewedSessionObject.token, response);

  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );

  return response.status(200).json(userFound);
}
