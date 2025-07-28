🎯 معرفی پروژه
<div style="font-size:20px;font-weight:600">یک سیستم توزیع‌شده برای پردازش رویدادها با معماری چندسرویسه شامل:</div>

API Gateway (Express.js)

Worker (پردازشگر پیام‌ها)

Real-time Service (Socket.IO)

پایگاه‌های داده: 
PostgreSQL, MongoDB, Redis

صف پیام:
RabbitMQ


📋 پیش‌نیازها
Node.js نسخه 16 یا بالاتر

PostgreSQL نسخه 14+

MongoDB نسخه 6+

Redis نسخه 7+

RabbitMQ نسخه 3.8+

🛠️ راه‌اندازی دستی
 نصب و راه‌اندازی پایگاه‌های داده:
 #راهنمای گام به گام نصب و راه‌اندازی PostgreSQL در ویندوز:
 1.ابتدا PostgreSQL را از سایت رسمی دانلود کنید:

لینک دانلود: https://www.postgresql.org/download/windows/
فایل installer را اجرا کنید و مراحل زیر را دنبال کنید:
1. روی Next کلیک کنید
2. مسیر نصب را انتخاب کنید (پیش‌فرض خوب است)
3. در صفحه Components همه گزینه‌ها را انتخاب کنید
4. در صفحه Data Directory مسیر ذخیره داده‌ها را انتخاب کنید
5. در صفحه Password:
   - رمز عبور را وارد کنید (مثلاً: postgres)
   - این رمز را یادداشت کنید
6. در صفحه Port عدد 5432 را بگذارید
7. در صفحه Locale گزینه [Default locale] را انتخاب کنید
8. روی Next کلیک کنید تا نصب کامل شود

مرحله 2: تنظیم اولیه PostgreSQL

پس از نصب کامل، CMD را به عنوان Administrator باز کنید و دستورات زیر را وارد کنید:

cd C:\Program Files\PostgreSQL\14\bin

psql -U postgres -c "CREATE USER dp_user WITH PASSWORD '123456';"

psql -U postgres -c "CREATE DATABASE datapipeline OWNER dp_user;"

psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE datapipeline TO dp_user;"

مرحله 3: راه‌اندازی سرویس

sc query postgresql-x64-14

سپس

net stop postgresql-x64-14

net start postgresql-x64-14

#راهنمای راه اندازی Mongodb:

پس از نصب و راه اندازی نرم افزار وارد برنامه شوید :

روی Create Database کلیک کنید

نام دیتابیس را event-db وارد کنید

نام collection اول را می‌توانید خالی بگذارید

Create را بزنید

برای مشاهده دیتابیس‌ها:

در بخش پایین پنل سمت چپ، لیست تمام دیتابیس‌ها نمایش داده می‌شود
در صفحه اصلی اتصال:

روی آیکون </> در بالای صفحه کلیک کنید

رشته اتصال نمایش داده می‌شود

آن را کپی کنید.
پس از تست اتصال موفق

روی Save Connection کلیک کنید

نامی برای این اتصال انتخاب کنید (مثلا Local Event DB)
سپس در کد خود برای اتصال از url کپی شده استفاده کنید(مثال استفاده در کد ها در قسمت connectMongo.js موجود است)

#راهنمای  راه اندازی RabittMQ:
از منوی Start، RabbitMQ Command Prompt را به عنوان Administrator اجرا کنید

دستورات زیر را وارد کنید:
rabbitmq-plugins enable rabbitmq_management

rabbitmq-service start

دسترسی به پنل مدیریت:

مرورگر خود را باز کنید و به آدرس زیر بروید:


http://localhost:15672
با اطلاعات پیش‌فرض وارد شوید:

Username: guest

Password: guest

پس از راه انداز یمیتوانید مطابق کد های موجود در  rabittmq.js و همینطور در پوشه service صفحه queue.js مشاهده کنید.
اول کانکشن برقرار می‌شود

سپس کانال ساخته می‌شود

صف تعریف می‌شود (اگر از قبل نباشد)

ارسال و دریافت شروع می‌شود
#راهنمای راه اندازی Redis:
در فایل .env (یا config.env) پروژه، آدرس Redis به شکل زیر تنظیم شده:REDIS_URL=redis://localhost:6379

استفاده در پروژه:

هنگام ثبت رویداد جدید، پس از ذخیره در پایگاه‌داده‌ها، داده‌ها در Redis cache می‌شوند.

در هنگام دریافت اطلاعات (GET)،
ابتدا Redis بررسی می‌شود تا از کش خوانده شود و در صورت نبود، از دیتابیس خوانده شده و در Redis ذخیره می‌شود.

همچنین Redis برای انتشار رویدادهای جدید به کلاینت‌های متصل از طریق WebSocket استفاده می‌شود (Pub/Sub).

استفاده عملی در کد ها در فایل config درقسمتconnectRedis.js و همینطور در قسمت worker جهت ثبت و پابلیش کردن داده ها و در قسمت server.js جهت ارسال از طریق socket قایل مشاهده است،ضمنا روابط مربوط به cachingدر فایل services قسمت cacheService.js نوشته شده است.


#معماری کلی سیستم:
📌 API Gateway (Express.js)
وظیفه: دریافت درخواست‌های REST از کاربر

کاربرد اصلی:

اعتبارسنجی داده‌های ورودی

ارسال رویدادها به صف RabbitMQ

پاسخ فوری به کاربر (بدون انتظار برای پردازش)

پورت: 5000

📌 Worker Service (Consumer)
وظیفه: پردازش موازی رویدادها

مراحل پردازش:

دریافت پیام از RabbitMQ

ذخیره ساختاریافته در PostgreSQL

ذخیره سند در MongoDB

آپدیت Redis Cache

انتشار رویداد برای Real-time Service

📌 Real-time Service (Socket.IO)
وظیفه: ارسال لحظه‌ای نوتیفیکیشن به کاربران

مکانیسم:

گوش دادن به کانال Redis (Pub/Sub)

ارسال داده از طریق WebSocket


#راه‌اندازی سرویس‌ها (در دو ترمینال جداگانه):
در ترمینال اول : npm run dev
در ترمینال دوم:npm run consumer
جهت ارسال داده و تست میتوانید از POST http://localhost:5000/api/events استفاده کنید.

#تست:
برای قسمت worker(processMessage) با استفاده از Mocha/Chai تست نویسی بر مینای unit test انجام شده ک با استفاده از کد npm tetsدر ترمینال نتایج قابل مشاهده خواهد بود.








