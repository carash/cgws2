Source code ini bisa diakses di:
https://github.com/carash/cgws2

Kelompok:
Achmad Firdaus Adinegoro - 1506732721
Tjokorde Gde Agung Octavio Putra - 1506726510
Wibisana Bramawidya - 1506731763

Panduan Penggunaan:
1. Gunakan XAMPP/Server lokal untuk menjalankan kode
2. Akses horse.html dari web browser localhost

Menus:
Menu terbagi menjadi beberapa kolom-kolom dan baris kontrol untuk tiap-tiap kode.
1. Animation Control : Untuk mengubah mode animasi dari mode ke manual, dan sebaliknya
2. Directional Light Control:
   Directional Light Control berupa kontrol dari lampu directional, secara default directional light bergerak dari kanan atas ke kiri bawah.
3. Point Light Control:
   Point Light Control untuk mengontrol point light ke kiri dan ke kanan.
4. Spot Light Control:
   Spot Light Control untuk mengontrol Spot light ke kiri dan ke kanan.

[NOMOR 5, 6, 7 HANYA BISA DIGUNAKAN KETIKA ANIMATION STOP]
5. Claw Control digunakan untuk mengubah posisi tangan (ikuti instruksi di halamannya.
6. Horse Control digunakan untuk mengubah posisi kaki dari kuda.
7. Block Control digunakan untuk mengontrol posisi dan orientasi dari block man.

8. Materials merupakan selection untuk 3 material berbeda.
9. Wireframe mode untuk mengubah face mode ke wireframe, vice versa.
10. Lights untuk menyalakan dan mematikan bayangan.
WARNING: BERAT!
NOTE:
Shadow menggunakan cara "curang" dimana dibuat model yang sama dengan MVP matriks dari lampu,
kemudian di translate secara manual.
Percobaan menggunakan shadow map entah kenapa tidak bisa berhasil menghasilkan tekstur shadow map yang
diinginkan (hasil percobaan ada di horse-backup.html)

11. Cameras
Untuk mengubah Mode kamera dari Free Camera. Ke Hand Crane Kamera (Kamera akan diubah jadi di posisi atas claw [seperti bermain tangkap boneka]).
12. Free Camera Control.. informasi hotkey untuk mengontrol kamera.

==================================

PROSES PEMBENTUKAN OBJEK - SCENE

1. Diinisialisasikan MVP Matriks yang nilai-nilainya merupakan transformasi dari data-data posisi yang sebelumnya disimpan dalam object.
2. Inisiasi tekstur.
3. Memanggil method render yang terdiri dari:
   a. Melakukan transformasi tambahan untuk objek terkait.
   b. Menghitung Normal dari objek tersebut.
   c. Render
   d. (Apabila dinyalakan), digunakan untuk render shadow.
Objek sudah termasuk scene.

==================================

ALGORITMA

Nothing too essensial, menggunakan kode2 dari contoh dan internet.

==================================

SOURCE
yang teringat adalah sebagai berikut:
https://webglfundamentals.org/webgl/lessons/webgl-3d-lighting-spot.html
https://stackoverflow.com/questions/43506820/webgl-spotlight
https://webglfundamentals.org/webgl/lessons/webgl-3d-lighting-point.html
https://learnopengl.com/Advanced-Lighting/Shadows/Point-Shadows
http://www.chinedufn.com/webgl-shadow-mapping-tutorial/
https://stackoverflow.com/questions/33159623/how-to-implement-shadow-mapping-in-webgl
http://learnwebgl.brown37.net/11_advanced_rendering/shadows.html
https://www.youtube.com/watch?v=fNK1E5DdYxk
https://www.youtube.com/watch?v=UnFudL21Uq4
http://www.opengl-tutorial.org/intermediate-tutorials/tutorial-16-shadow-mapping/

Kode dari webgl-master dan contoh dari buku.

==================================

LOG
Wibisana Bramawidya:
1. Claw Model & Animation
2. Provide Gitlab

Tjokorde Gde Agung Octavio Putra:
1. Horse Model & Animation
2. Block Man Model & Animation
3. Texture
4. Material
5. Other Models
6. Wireframe
7. Dokumentasi

Achmad Firdaus Adinegoro:
1. Spot Lights (Shaders + Implementation + Control)
2. Point Lights (Shaders + Implementation + Control)
3. Directional Lights (Shaders + Implementation + Control)
4. Normal Implementation
5. Shadow Map Implementation (fail tho) + Camera Render
6. Camera Projection
7. Camera Movement
8. On - Off Lights
9. Implement second shaders
10. Dokumentasi
