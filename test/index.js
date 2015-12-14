var ctx = require.context('./', true, /.+\.spec\.js?$/);
ctx.keys().forEach(ctx);
