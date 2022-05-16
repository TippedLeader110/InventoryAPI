var express = require('express');
var router = express.Router();

const { database } = require('./models/dbcon');


var hitungStock = (stock) => {


}

router.post('/del_users', (req, res, next) => {
   database
      .table('users')
      .filter({ id_user: req.body.id_user })
      .remove()
      .then(resp => {
         console.log(resp)
         res.json(resp)
      })
})

router.post('/login_users', (req, res, next) => {
   console.log(req.body)
   database.table('users').filter({ username: req.body.username, password: req.body.password }).count().then(c => {
      if (c != 0) {
         database.table('users').filter({ username: req.body.username, password: req.body.password }).get().then(data => {
            res.json({
               status: data.level
            })
         })
      } else {
         res.json({
            status: 10
         })
      }
   })
})

router.get('/inv_stock_hitung', (req, res, next) => {
   database.table("stock").getAll().then(elm => {

      var newstock = [];
      var masuk = [];
      var keluar = [];
      database
         .table("transaksi").filter({ tipe_transaksi: 1 }).getAll().then(data => {
            masuk = data;
            database
               .table("transaksi").filter({ tipe_transaksi: 2 }).getAll().then(data2 => {
                  keluar = data2

                  elm.forEach(stock => {
                     tkeluar = 0;
                     tmasuk = 0;
                     total = stock.stock;

                     keluar.forEach(element => {
                        if (stock.kode_barang == element.kode_barang) {
                           tkeluar += element.jumlah
                        }
                     });

                     masuk.forEach(element => {
                        if (stock.kode_barang == element.kode_barang) {
                           tmasuk += element.jumlah
                        }
                     });

                     if (tmasuk > tkeluar) {
                        var temp = tmasuk - tkeluar;
                        total += temp;
                     } else {
                        var temp = tkeluar - tmasuk;
                        total -= temp;
                     }

                     stock.stock = total;
                     newstock.push(stock);
                  });

                  console.log(newstock)

                  res.json(newstock)

               })
         })


   })
})

/* GET home page. */
router.get('/', function (req, res, next) {
   res.render('index', { title: 'Express' });
});

router.post('/inv_transaksi', (req, res, next) => {
   var tipe = req.body.tipe_transaksi;

   database
      .table('transaksi')
      .filter({ tipe_transaksi: tipe })
      .getAll()
      .then(data => {
         res.json(
            data
         )
      })

})

router.get('/inv_transaksiall', (req, res, next) => {
   // var tipe = req.body.tipe_transaksi;

   database
      .table('transaksi')
      .getAll()
      .then(data => {
         res.json(
            data
         )
      })

})

router.post('/inv_transaksi_detil', (req, res, next) => {
   database
      .table('transaksi')
      .filter({ id_transaksi: req.body.id_transaksi })
      .get()
      .then(data => {
         res.json(data)
      })
})

router.post('/inv_transaksi_filter', (req, res, next) => {
   var tipe = req.body.tipe_transaksi;

   database
      .table('transaksi')
      .filter({
         tipe_transaksi: tipe,
         tgl_transaksi: { $between: [req.body.start, req.body.end] }
      })
      .getAll()
      .then(data => {
         res.json({
            data
         })
      })

})

router.post('/add_transaksi', (req, res) => {
   var bd = req.body;
   database
      .table("stock")
      .filter({ kode_barang: req.body.kode_barang })
      .get()
      .then(d => {
         database
            .table('transaksi')
            .insert({
               kode_barang: bd.kode_barang,
               jumlah: bd.jumlah,
               catatan: bd.catatan,
               nama: bd.nama,
               tgl_transaksi: bd.tgl_transaksi,
               nama_transaksi: d.nama_barang,
               tipe_transaksi: bd.tipe_transaksi
            }).then(data => {
               console.log(data)
               res.json({
                  response: data,
                  msg: 'Transaksi ditambah',
                  status: true,
                  code: 200
               })
            })
      })

})

router.post('/edit_transaksi', (req, res) => {
   database
      .table('transaksi')
      .filter({ id_transaksi: req.body.id_transaksi })
      .count()
      .then(total => {
         if (total != 0) {
            database.table('transaksi').filter({ id_transaksi: req.body.oldid }).update({
               kode_barang: req.body.kode_barang,
               jumlah: req.body.jumlah,
               catatan: req.body.catatan,
               nama: req.body.nama,
               tgl_transaksi: req.body.tgl_transaksi,
               tipe_transaksi: req.body.tipe_transaksi
            }).then(response => {
               res.json({
                  response: response,
                  msg: 'Data transaksi barang berhasil di edit',
                  status: true,
                  code: 200
               })
            }).catch(err => {
               console.log(err)
               res.json({
                  response: response,
                  msg: 'Terjadi kesalahan periksa log',
                  status: true,
                  code: 400
               })
            })
         } else {
            res.json({
               response: [],
               msg: "data tidak ditemukan",
               status: false,
               code: 400
            })
         }
      })
})

router.post('/add_stock', (req, res) => {
   database
      .table('stock')
      .filter({ kode_barang: req.body.kode_barang })
      .count()
      .then(total => {
         if (total == 0) {
            database.table('stock').insert({
               kode_barang: req.body.kode_barang,
               stock: req.body.stock,
               nama_barang: req.body.nama_barang,
               satuan: req.body.satuan,
               nilai_satuan: req.body.nilai_satuan,
               harga: req.body.harga
            }).then(response => {
               res.json({
                  response: response,
                  msg: 'Stock ditambah',
                  status: true,
                  code: 200
               })
            }).catch(err => { console.log(err) })
         } else {
            res.json({
               response: [],
               msg: "Kode barang telah digunakan",
               status: false,
               code: 300
            })
         }
      })
})

router.post('/hapus_stock', (req, res) => {
   database
      .table('stock')
      .filter({ kode_barang: req.body.kode_barang })
      .remove()
      .then(resp => {
         console.log(resp)
         if (resp) {
            res.json({
               msg: "Data berhasil dihapus",
               code: 200
            })
         }
      })
})

router.post('/hapus_transaksi', (req, res) => {
   database
      .table('transaksi')
      .filter({ id_transaksi: req.body.id_transaksi })
      .remove()
      .then(resp => {
         console.log(resp)
         if (resp) {
            res.json({
               msg: "Data berhasil dihapus",
               code: 200
            })
         }
      })
})

router.post('/edit_stock', (req, res) => {
   database
      .table('stock')
      .filter({ kode_barang: req.body.kode_barang })
      .count()
      .then(total => {
         if (total == 0) {
            database.table('stock').filter({ kode_barang: req.body.oldid }).update({
               kode_barang: req.body.kode_barang,
               stock: req.body.stock,
               nama_barang: req.body.nama_barang,
               satuan: req.body.satuan,
               nilai_satuan: req.body.nilai_satuan,
               harga: req.body.harga
            }).then(response => {
               res.json({
                  response: response,
                  msg: 'Data stock barang berhasil di edit',
                  status: true,
                  code: 200
               })
            }).catch(err => {
               console.log(err)
               res.json({
                  response: response,
                  msg: 'Terjadi kesalahan periksa log',
                  status: true,
                  code: 400
               })
            })
         } else {
            res.json({
               response: [],
               msg: "Kode barang telah digunakan",
               status: false,
               code: 400
            })
         }
      })
})

async function getStock() {
   var barang = []
   await database
      .table('stock')
      .getAll()
      .then(async brg => {
         // console.log(barang)
         barang = brg
      })

   var newbarang = [];
   var newfloat = [];
   for(var i = 0; i < barang.length; i++){
      var element = barang[i];
   // barang.forEach(async element => {
      var jumlah1 = 0;
      await database.table('transaksi').filter({ tipe_transaksi: 1, kode_barang: element.kode_barang }).getAll().then(data => {
         data.forEach(element => {
            jumlah1 = jumlah1 + element.jumlah;
         });
      })
      var jumlah2 = 0;
      await database.table('transaksi').filter({ tipe_transaksi: 2, kode_barang: element.kode_barang }).getAll().then(data => {
         data.forEach(element => {
            console.log('element');
            console.log(element);
            jumlah2 = jumlah2 + element.jumlah;
         });
      })
      var stock = element.stock;
      stock += jumlah1;
      stock -= jumlah2;
      console.log(element.kode_barang)
      console.log(stock)


      var data = {
         "kode_barang": element.kode_barang,
         "nama_barang": element.nama_barang,
         "stock": stock,
         "satuan": element.satuan,
         "nilai_satuan": element.nilai_satuan,
         "harga": element.harga
      }
      console.log(data)
      newbarang.push(data)
   // });
   }
   console.log("newbarang")
   console.log(newbarang)
   return newbarang;
}

router.get('/inv_stock', (req, res, next) => {
   database
      .table('stock')
      .getAll()
      .then(barang => {
         console.log(barang)
         res.json(
            barang
         )
      })
})



router.post('/inv_stock_id', (req, res) => {
   var mode = req.body.mode;
   if (mode == 1) {
      database
         .table('stock')
         .filter({ "kode_barang": req.body.kode_barang })
         .get()
         .then(data => {
            console.log(data)
            res.json(
               data
            )
         })
   }
   // else if(mode==2){
   //    database
   //       .table('stock')
   //       .filter({ "id_stock": req.body.id})
   //       .remove
   // }
})

router.get('/daftar_users', (req, res, next) => {
   database.table('users').getAll().then(response => res.json(response))
})

router.post('/add_admin', (req, res) => {
   database
      .table('users')
      .filter({ username: req.body.username, password: req.body.password })
      .count()
      .then(total => {
         if (total == 0) {
            database.table('users').insert({
               username: req.body.username,
               password: req.body.password,
               nama: req.body.nama,
               level: req.body.level
            }).then(response => {
               res.json({
                  response: response,
                  msg: 'Akun ditambah',
                  status: true,
                  code: 200
               })
            }).catch(err => { console.log(err) })
         } else {
            res.json({
               response: [],
               msg: "Username telah digunakan",
               status: false,
               code: 300
            })
         }
      })
})

router.post('/login', (req, res) => {
   database
      .table('users')
      .filter({ username: req.body.username, password: req.body.password })
      .get()
      .then(response => {
         if (response) {
            res.json({
               level: response.level,
               nama: response.nama,
               msg: "Login berhasil",
               status: true,
               code: 200
            })
         } else {
            res.json({
               msg: "Username/password tidak valid",
               status: false,
               code: 300
            })
         }
      })
      .catch(err => {
         console.log(err)
         res.json({
            response: response,
            msg: 'Terjadi kesalahan periksa log',
            status: true,
            code: 400
         })
      })
})



module.exports = router;
