import passport from 'passport';

export function requireAuth(permission) {
  return async (ctx, next) => {
    console.log('Auth user ', permission);
    let user = null;
    switch (permission) {
      case 'read':
        if (ctx.isAuthenticated()) {
          await next();
        } else {
          ctx.status = 401;
        }
        break;
      case 'update':
        if (ctx.isAuthenticated()) {
          const user = ctx.state.user;
          const { userId } = ctx.params;
          if (user.userId !== userId) {
            ctx.status = 401;
            return;
          }
          await next();
        } else {
          ctx.status = 401;
        }
        break;
      default:
        console.log('Unknow permission ', permission);
    }
    ctx.state.user = user;
  };
}

export async function authenticateUser(ctx, next) {
  if (ctx.isAuthenticated()) {
    await next();
    return;
  }
  return passport.authenticate('local', async (err, user) => {
    if (err || !user) {
      ctx.status = 401;
      ctx.body = { error: 'Unauthorized' };
      return err;
    }
    await ctx.login(user);
    ctx.state.user = user;
    ctx.body = user;
  })(ctx);
}

export async function logout(ctx) {
  if (ctx.isAuthenticated()) {
    await ctx.logout();
  }
  ctx.body = { status: 'ok' };
}
