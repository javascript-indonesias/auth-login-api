const authLogoutController = (_req, res) => {
    // Jika pengguna logout, hapus cookie JWT
    // Setel max token expired menjadi lebih cepat
    res.cookie('jwtToken', '', { maxAge: 1000 });
    res.redirect('/');
};

export default authLogoutController;
