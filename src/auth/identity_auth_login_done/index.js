const { response } = require("../../utils");
const jwt = require("jsonwebtoken");
const SWA_EMU_AUTH_URI = process.env.SWA_EMU_AUTH_URI || `http://localhost:4242`;
const { currentUser } = require("../../userManager");

const jwtKey = "123";
const jwtExpirySeconds = 300;

module.exports = async function (context, req) {
  const { cookie } = req.headers;
  const payload = {
    ...currentUser(cookie),
    nonce: context.invocationId,
    iss: "localhost",
    aud: "localhost",
  };
  const user_login_jwt = jwt.sign(payload, jwtKey, {
    algorithm: "HS256",
    expiresIn: jwtExpirySeconds,
  });

  context.res = response({
    context,
    status: 200,
    cookies: [
      {
        name: "StaticWebAppsAuthContextCookie",
        value: "deleted",
        path: "/",
        domain: "localhost",
      },
    ],
    headers: {
      "Content-Type": "text/html",
      status: 200,
    },
    body: `
    <title>Working...</title>
    <form id="f" method="POST" action="${SWA_EMU_AUTH_URI}/app/.auth/complete">
      <input type="hidden" name="user_login_jwt" value="${user_login_jwt}" />
      <noscript>
        <p>Script is disabled.Click Submit to continue.</p>
        <input type="submit" value="Submit" />
        </noscript>
      </form>
      <script>f.submit();</script>`,
  });
};