export function requireAuth(permission) {
  return ctx => {
    console.log('Auth user ', permission);
    switch (permission) {
      case 'read':
        //TODO: READ AUTH
        break;
      case 'update':
        // TODO: WRITE AUTH
        break;
      default:
        console.log('Unknow permission ', permission);
    }
    ctx.state.user = { username: 'ziyang' };
  };
}