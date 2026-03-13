export default async function handler(req, res) {

  const code = req.query.code;

  if (!code) {
    return res.redirect('/locked.html');
  }

  res.redirect('/hub.html');

}
