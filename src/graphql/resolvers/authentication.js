require("dotenv").config();
const { Database } = require("../../data/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = parseInt(process.env.SALT_ROUNDS) || 12;
const { errorName } = require("../../helpers/error-contants");
const { GraphQLClient } = require("graphql-request");
const notificationsApi = process.env.NOTIFICATIONS_API;
const dayjs = require("dayjs");
require("dayjs/locale/pt-br");

dayjs.locale("pt-br");

module.exports = {
  signIn: async (args, req) => {
    const authentication = await Database("users")
      .select(
        "users.*",
        "authentications.password as password",
        "authentications.id as authenticationId"
      )
      .where("users.email", args.authentication.email)
      .andWhere("users.type", args.authentication.userType)
      .join("authentications", "users.id", "authentications.userId");
    if (authentication.length == 0) {
      throw new Error(errorName.USER_NOT_FOUND);
    }
    const isEqual = await bcryptComparePasswords(
      args.authentication.password,
      authentication[0].password
    );
    if (!isEqual) {
      throw new Error(errorName.INVALID_CREDENTIALS);
    }
    const token = jwt.sign(
      {
        userId: authentication[0].id,
        userName: authentication[0].userName,
        email: authentication[0].email,
        type: authentication[0].type,
        status: authentication[0].status,
        grantType: "password",
      },
      process.env.TOKEN_KEY,
      {
        expiresIn: "1h",
      }
    );
    const refreshToken = jwt.sign(
      { userId: authentication[0].id, grantType: "refresh_token" },
      process.env.REFRESH_TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    const today = new Date();

    console.log("autenticado")

    await Database("authentications")
      .update("lastAccess", today)
      .where("id", authentication[0].authenticationId);
    return {
      id: authentication[0].id,
      userName: authentication[0].userName,
      email: authentication[0].email,
      type: authentication[0].type,
      status: authentication[0].status,
      token: token,
      refreshToken: refreshToken,
    };
  },
  signUp: async (args, req) => {
    let verifyExistUserAuth = await Database("authentications").where(
      "userId",
      args.signUp.userId
    );
    let verifyExistUser = await Database("users").where(
      "id",
      args.signUp.userId
    );

    if (verifyExistUser.length == 0) {
      throw new Error(errorName.USER_NOT_FOUND);
    }

    if (verifyExistUserAuth.length > 0) {
      throw new Error(errorName.USER_ALREADY_SIGNUP);
    }

    let bcryptPasswordVar = await bcryptPassword(args.signUp.password);

    let today = dayjs();

    let userAuth = {
      userId: args.signUp.userId,
      password: bcryptPasswordVar,
      createDate: today.toDate(),
    };

    await Database("authentications").insert(userAuth);
    const token = jwt.sign(
      {
        userId: args.signUp.userId,
        userName: args.signUp.userName,
        email: args.signUp.email,
        type: args.signUp.type,
        status: args.signUp.status,
        grantType: "password",
      },
      process.env.TOKEN_KEY,
      {
        expiresIn: "1h",
      }
    );
    const refreshToken = jwt.sign(
      { userId: args.signUp.userId, grantType: "refresh_token" },
      process.env.REFRESH_TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );

    return {
      id: args.signUp.userId,
      userName: args.signUp.userName,
      email: args.signUp.email,
      type: args.signUp.type,
      status: args.signUp.status,
      token: token,
      refreshToken: refreshToken,
    };
  },
  refreshToken: async (args, req) => {
    let decodedToken;
    try {
      decodedToken = await jwt.verify(
        args.refreshToken,
        process.env.REFRESH_TOKEN_KEY
      );
    } catch (err) {
      throw new Error(errorName.INVALID_REFRESH_TOKEN);
    }

    const authentication = await Database("users")
      .select("users.*")
      .where("users.id", decodedToken.userId);

    if (authentication.length == 0) {
      throw new Error(errorName.USER_NOT_FOUND);
    }
    const newToken = jwt.sign(
      {
        userId: authentication[0].id,
        userName: authentication[0].userName,
        email: authentication[0].email,
        type: authentication[0].type,
        status: authentication[0].status,
        grantType: "password",
      },
      process.env.TOKEN_KEY,
      {
        expiresIn: "1h",
      }
    );
    const newRefreshToken = jwt.sign(
      { userId: authentication[0].id, grantType: "refresh_token" },
      process.env.REFRESH_TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    return {
      id: authentication[0].id,
      userName: authentication[0].userName,
      email: authentication[0].email,
      type: authentication[0].type,
      status: authentication[0].status,
      token: newToken,
      refreshToken: newRefreshToken,
    };
  },
  verifyToken: async (args, req) => {
    return decodedToken(args.token);
  },
  forgotPassword: async (args, req) => {
    let today = dayjs();

    const user = await Database("users")
      .select(
        "users.*",
        "authentications.password as Password",
        "authentications.id as AuthenticationId"
      )
      .where("users.email", args.forgotPassword.email)
      .andWhere("users.type", args.forgotPassword.userType)
      .join("authentications", "users.id", "authentications.userId");

    //Valid if user exist
    if (user.length <= 0) {
      throw new Error(errorName.USER_NOT_FOUND);
    }
    //verify token code
    let verifyTokenCode = await Database("verify_tokens")
      .where("userId", user[0].id)
      .andWhere("type", "forgotPassword")
      .andWhere("token", args.forgotPassword.verifyToken)
      .andWhere("expireDate", ">=", today.toDate())
      .orderBy("createDate", "desc");

    if (verifyTokenCode.length == 0) {
      throw new Error(errorName.INVALID_VERIFY_TOKEN);
    }

    if (args.forgotPassword.password !== args.forgotPassword.confirmPassword) {
      throw new Error(errorName.INVALID_CONFIRM_PASSWORD);
    }

    //Encript the password for storage
    let bcryptPasswordVar = await bcryptPassword(args.forgotPassword.password);

    const AuthenticationUpdate = {
      updateDate: today.toDate(),
      password: bcryptPasswordVar,
    };

    await Database("authentications")
      .update(AuthenticationUpdate)
      .where("id", user[0].AuthenticationId);

    return {
      message: "Password was changed",
    };
  },
  changePassword: async (args, req) => {
    let decodedTokenVar = decodedToken(args.token);
    const authentication = await Database("authentications").where(
      "userId",
      decodedTokenVar.userId
    );
    if (authentication.length == 0) {
      throw new Error(errorName.USER_NOT_FOUND);
    }
    const isEqual = await bcryptComparePasswords(
      args.currentPassword,
      authentication[0].password
    );
    if (!isEqual) {
      throw new Error(errorName.INVALID_CREDENTIALS);
    }

    //Encript the password for storage
    let bcryptPasswordVar = await bcryptPassword(args.newPassword);

    let updateAuthentication = {
      updateDate: dayjs().toDate(),
      password: bcryptPasswordVar,
    };

    await Database("authentications")
      .update(updateAuthentication)
      .where("userId", decodedTokenVar.userId);

    return {
      message: "Password was changed",
    };
  },
  generateVerifyToken: async (args, req) => {
    let today = dayjs();
    let expired = today.add(
      parseInt(process.env.VERIFY_TOKEN_EXPIRED_IN_MINUTES),
      "minute"
    );
    const authentication = await Database("users")
      .select(
        "users.*",
        "authentications.password as password",
        "authentications.id as authenticationId"
      )
      .where("users.email", args.verifyToken.email)
      .andWhere("users.type", args.verifyToken.userType)
      .join("authentications", "users.id", "authentications.userId");

    if (authentication.length == 0) {
      throw new Error(errorName.USER_NOT_FOUND);
    }

    //generate a random code with 6 numbers digits
    let verifyTokenGenerate = Math.floor(100000 + Math.random() * 900000);

    console.log(verifyTokenGenerate);

    //call notifications APi for send this token verify to user
    const client = new GraphQLClient(notificationsApi, {
      headers: {
        Authorization: `Bearer ${process.env.NOTIFICATIONS_ITERNAL_TOKEN}`,
      },
    });
    let messageSMS = `Maranzatto - Seu Token para redefinicao de senha e ${verifyTokenGenerate}`;

    const payloadSMS = `
      mutation {
        sendSmsMessage(message: {
          receivers: ["${authentication[0].whatsApp}"],
          content: "${messageSMS}",
          senderId: "${args.verifyToken.type}-${args.verifyToken.email}-${
      args.verifyToken.userType
    }-${today.format("DD/MM/YYYYTHH:mm")}"
       }) {
         message
       }
     }`;
    return await client
      .request(payloadSMS)
      .then(async (res) => {
        console.log(res);

        let verifyDb = {
          token: verifyTokenGenerate,
          userId: authentication[0].id,
          type: args.verifyToken.type,
          createDate: today.toDate(),
          expireDate: expired.toDate(),
        };
        await Database("verify_tokens").insert(verifyDb);
        return {
          email: authentication[0].email,
          whatsApp: authentication[0].whatsApp,
          type: args.verifyToken.type,
          userType: authentication[0].type,
        };
      })
      .catch((err) => {
        throw new Error(err);
      });
  },
};

function decodedToken(token) {
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.TOKEN_KEY);
  } catch (err) {
    throw new Error(errorName.INVALID_TOKEN);
  }

  if (!decodedToken) {
    throw new Error(errorName.INVALID_TOKEN);
  }

  if (decodedToken.grantType !== "password") {
    throw new Error(errorName.INVALID_GRANT_TYPE);
  }
  return {
    userId: decodedToken.userId,
    userName: decodedToken.userName,
    email: decodedToken.email,
    type: decodedToken.type,
    status: decodedToken.status,
    grantType: decodedToken.grantType,
  };
}

const bcryptPassword = async (password) => {
  //Encript the password for storage
  return await bcrypt.hash(password, saltRounds).then(function (hash) {
    return hash;
  });
};

const bcryptComparePasswords = async (password, passwordDb) => {
  return bcrypt.compare(password, passwordDb);
};
