exports.errorName = {
    UNAUTHENTICATED: 'UNAUTHENTICATED',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    INVALID_TOKEN: 'INVALID_TOKEN',
    INVALID_REFRESH_TOKEN:'INVALID_REFRESH_TOKEN',
    INVALID_GRANT_TYPE: 'INVALID_GRANT_TYPE',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    USER_ALREADY_SIGNUP: 'USER_ALREADY_SIGNUP',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    INVALID_VERIFY_TOKEN: 'INVALID_VERIFY_TOKEN',
    INVALID_CONFIRM_PASSWORD: 'INVALID_CONFIRM_PASSWORD'
}
exports.errorType = {
    UNAUTHENTICATED: {
        message: 'Usuário não autenticado',
        statusCode: 401,
        errorCode: 4001
    },
    USER_NOT_FOUND:{
        message: 'Usuário informado não existe',
        statusCode: 404,
        errorCode: 4004
    },
    USER_ALREADY_SIGNUP:{
        message: 'Usuário informado já existe',
        statusCode: 400,
        errorCode: 4300
    },
    INVALID_CREDENTIALS:{
        message: 'Senha incorreta',
        statusCode: 404,
        errorCode: 4104
    },
    INVALID_TOKEN:{
        message: 'Token inválido',
        statusCode: 400,
        errorCode: 4000
    },
    INVALID_REFRESH_TOKEN:{
        message: 'Token inválido, não foi possível revalidar',
        statusCode: 400,
        errorCode: 4100
    },
    INVALID_GRANT_TYPE:{
        message: 'grant type incorreto',
        statusCode: 400,
        errorCode: 4200
    },
    INVALID_VERIFY_TOKEN:{
        message: 'Token de verificação inválido',
        statusCode: 404,
        errorCode: 4004
    },
    INVALID_CONFIRM_PASSWORD:{
        message: 'A senha e confirmação da senha não conferem',
        statusCode: 404,
        errorCode: 4005
    },
    INTERNAL_ERROR:{
        message: 'Erro interno do servidor',
        statusCode: 500,
        errorCode: 5000
    },

}