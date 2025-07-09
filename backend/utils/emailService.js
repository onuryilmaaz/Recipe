const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Create email transporter
const createTransporter = () => {
  // For development - use ethereal email (fake smtp service)
  // In production, use a real email service like Gmail, SendGrid, etc.

  if (process.env.NODE_ENV === "production") {
    // Production email config
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Development - using ethereal email for testing
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "ethereal.user@ethereal.email",
        pass: "ethereal.pass",
      },
    });
  }
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Send verification email
const sendVerificationEmail = async (user, token) => {
  try {
    const transporter = createTransporter();

    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@recipeshare.com",
      to: user.email,
      subject: "Email Adresinizi Doğrulayın - Recipe Share",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #EA580C; margin: 0;">Recipe Share</h1>
            <p style="color: #6B7280; margin: 5px 0;">Lezzetli tariflerin paylaşım platformu</p>
          </div>
          
          <div style="background: #F9FAFB; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #111827; margin-top: 0;">Merhaba ${user.name}!</h2>
            <p style="color: #4B5563; line-height: 1.6;">
              Recipe Share'e hoş geldiniz! Email adresinizi doğrulamak için aşağıdaki butona tıklayın.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; padding: 12px 30px; background: #EA580C; color: white; 
                        text-decoration: none; border-radius: 6px; font-weight: bold;">
                Email Adresimi Doğrula
              </a>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; margin-bottom: 0;">
              Eğer buton çalışmıyorsa, bu linki kopyalayıp tarayıcınıza yapıştırabilirsiniz:<br>
              <a href="${verificationUrl}" style="color: #EA580C; word-break: break-all;">${verificationUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
            <p>Bu link 24 saat içinde geçerliliğini yitirecektir.</p>
            <p>Bu email'i siz talep etmediyseniz, güvenle silebilirsiniz.</p>
          </div>
        </div>
      `,
      text: `
        Merhaba ${user.name}!
        
        Recipe Share'e hoş geldiniz! Email adresinizi doğrulamak için aşağıdaki linke tıklayın:
        ${verificationUrl}
        
        Bu link 24 saat içinde geçerliliğini yitirecektir.
        
        Bu email'i siz talep etmediyseniz, güvenle silebilirsiniz.
        
        Recipe Share Ekibi
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

// Send welcome email after verification
const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@recipeshare.com",
      to: user.email,
      subject: "Hoş Geldiniz! - Recipe Share",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #EA580C; margin: 0;">Recipe Share</h1>
            <p style="color: #6B7280; margin: 5px 0;">Lezzetli tariflerin paylaşım platformu</p>
          </div>
          
          <div style="background: #F0FDF4; padding: 30px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #10B981;">
            <h2 style="color: #111827; margin-top: 0;">🎉 Email adresiniz doğrulandı!</h2>
            <p style="color: #4B5563; line-height: 1.6;">
              Merhaba <strong>${
                user.name
              }</strong>! Recipe Share ailesine hoş geldiniz. 
              Artık platformumuzun tüm özelliklerini kullanabilirsiniz.
            </p>
            
            <h3 style="color: #111827; margin-top: 25px;">Neler yapabilirsiniz?</h3>
            <ul style="color: #4B5563; line-height: 1.8;">
              <li>🍳 Kendi tariflerinizi paylaşın</li>
              <li>❤️ Beğendiğiniz tarifleri favorilere ekleyin</li>
              <li>⭐ Tarifleri değerlendirin ve yorum yapın</li>
              <li>📚 Tarif koleksiyonları oluşturun</li>
              <li>🔍 Gelişmiş arama ile istediğiniz tarifleri bulun</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" 
                 style="display: inline-block; padding: 12px 30px; background: #EA580C; color: white; 
                        text-decoration: none; border-radius: 6px; font-weight: bold;">
                Tarif Keşfetmeye Başla
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
            <p>Keyifli tarifler dileriz! 👨‍🍳👩‍🍳</p>
          </div>
        </div>
      `,
      text: `
        🎉 Email adresiniz doğrulandı!
        
        Merhaba ${user.name}! Recipe Share ailesine hoş geldiniz. 
        Artık platformumuzun tüm özelliklerini kullanabilirsiniz.
        
        Neler yapabilirsiniz?
        • Kendi tariflerinizi paylaşın
        • Beğendiğiniz tarifleri favorilere ekleyin
        • Tarifleri değerlendirin ve yorum yapın
        • Tarif koleksiyonları oluşturun
        • Gelişmiş arama ile istediğiniz tarifleri bulun
        
        Keyifli tarifler dileriz!
        
        Recipe Share Ekibi
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
};

// Send resend verification email
const sendResendVerificationEmail = async (user, token) => {
  try {
    const transporter = createTransporter();

    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@recipeshare.com",
      to: user.email,
      subject: "Email Doğrulama - Yeniden Gönderim - Recipe Share",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #EA580C; margin: 0;">Recipe Share</h1>
            <p style="color: #6B7280; margin: 5px 0;">Lezzetli tariflerin paylaşım platformu</p>
          </div>
          
          <div style="background: #FEF3C7; padding: 30px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #F59E0B;">
            <h2 style="color: #111827; margin-top: 0;">Email Doğrulama Linki</h2>
            <p style="color: #4B5563; line-height: 1.6;">
              Merhaba ${user.name}! Email doğrulama linkinizi yeniden gönderiyoruz.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; padding: 12px 30px; background: #EA580C; color: white; 
                        text-decoration: none; border-radius: 6px; font-weight: bold;">
                Email Adresimi Doğrula
              </a>
            </div>
            
            <p style="color: #6B7280; font-size: 14px;">
              Bu yeni link 24 saat boyunca geçerli olacaktır.
            </p>
          </div>
          
          <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
            <p>Bu email'i siz talep etmediyseniz, güvenle silebilirsiniz.</p>
          </div>
        </div>
      `,
      text: `
        Merhaba ${user.name}!
        
        Email doğrulama linkinizi yeniden gönderiyoruz:
        ${verificationUrl}
        
        Bu yeni link 24 saat boyunca geçerli olacaktır.
        
        Recipe Share Ekibi
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Resend verification email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error("Error sending resend verification email:", error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (user, token) => {
  try {
    const transporter = createTransporter();

    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@recipeshare.com",
      to: user.email,
      subject: "Şifre Sıfırlama Talebi - Recipe Share",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #EA580C; margin: 0;">Recipe Share</h1>
            <p style="color: #6B7280; margin: 5px 0;">Lezzetli tariflerin paylaşım platformu</p>
          </div>
          
          <div style="background: #FEF2F2; padding: 30px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #EF4444;">
            <h2 style="color: #111827; margin-top: 0;">🔒 Şifre Sıfırlama Talebi</h2>
            <p style="color: #4B5563; line-height: 1.6;">
              Merhaba <strong>${user.name}</strong>! Hesabınız için şifre sıfırlama talebinde bulundunuz. 
              Yeni şifrenizi belirlemek için aşağıdaki butona tıklayın.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; padding: 12px 30px; background: #EF4444; color: white; 
                        text-decoration: none; border-radius: 6px; font-weight: bold;">
                Şifremi Sıfırla
              </a>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; margin-bottom: 0;">
              Eğer buton çalışmıyorsa, bu linki kopyalayıp tarayıcınıza yapıştırabilirsiniz:<br>
              <a href="${resetUrl}" style="color: #EF4444; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          
          <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #92400E; margin: 0; font-size: 14px;">
              <strong>⚠️ Güvenlik Uyarısı:</strong> Bu link sadece 1 saat boyunca geçerlidir. 
              Eğer bu talebi siz yapmadıysanız, bu email'i güvenle silebilirsiniz.
            </p>
          </div>
          
          <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
            <p>Recipe Share - Güvenli tarif paylaşımı</p>
          </div>
        </div>
      `,
      text: `
        🔒 Şifre Sıfırlama Talebi
        
        Merhaba ${user.name}! Hesabınız için şifre sıfırlama talebinde bulundunuz. 
        Yeni şifrenizi belirlemek için aşağıdaki linke tıklayın:
        
        ${resetUrl}
        
        ⚠️ Güvenlik Uyarısı: Bu link sadece 1 saat boyunca geçerlidir. 
        Eğer bu talebi siz yapmadıysanız, bu email'i güvenle silebilirsiniz.
        
        Recipe Share Ekibi
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
};

// Send password reset confirmation email
const sendPasswordResetConfirmationEmail = async (user) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@recipeshare.com",
      to: user.email,
      subject: "Şifreniz Başarıyla Değiştirildi - Recipe Share",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #EA580C; margin: 0;">Recipe Share</h1>
            <p style="color: #6B7280; margin: 5px 0;">Lezzetli tariflerin paylaşım platformu</p>
          </div>
          
          <div style="background: #F0FDF4; padding: 30px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #10B981;">
            <h2 style="color: #111827; margin-top: 0;">✅ Şifreniz Başarıyla Değiştirildi</h2>
            <p style="color: #4B5563; line-height: 1.6;">
              Merhaba <strong>${
                user.name
              }</strong>! Hesabınızın şifresi başarıyla değiştirildi.
            </p>
            
            <div style="background: #ECFDF5; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #047857; margin: 0; font-size: 14px;">
                <strong>📅 Değişiklik Zamanı:</strong> ${new Date().toLocaleString(
                  "tr-TR"
                )}<br>
                <strong>🔐 Güvenlik:</strong> Artık yeni şifrenizle giriş yapabilirsiniz
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${
                process.env.FRONTEND_URL || "http://localhost:3000"
              }/login" 
                 style="display: inline-block; padding: 12px 30px; background: #EA580C; color: white; 
                        text-decoration: none; border-radius: 6px; font-weight: bold;">
                Giriş Yap
              </a>
            </div>
          </div>
          
          <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #92400E; margin: 0; font-size: 14px;">
              <strong>⚠️ Bu değişikliği siz yapmadıysanız:</strong> Derhal bizimle iletişime geçin. 
              Hesabınızın güvenliği tehlikede olabilir.
            </p>
          </div>
          
          <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
            <p>Recipe Share - Güvenli tarif paylaşımı</p>
          </div>
        </div>
      `,
      text: `
        ✅ Şifreniz Başarıyla Değiştirildi
        
        Merhaba ${user.name}! Hesabınızın şifresi başarıyla değiştirildi.
        
        📅 Değişiklik Zamanı: ${new Date().toLocaleString("tr-TR")}
        🔐 Güvenlik: Artık yeni şifrenizle giriş yapabilirsiniz
        
        ⚠️ Bu değişikliği siz yapmadıysanız: Derhal bizimle iletişime geçin. 
        Hesabınızın güvenliği tehlikede olabilir.
        
        Recipe Share Ekibi
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset confirmation email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error("Error sending password reset confirmation email:", error);
    return false;
  }
};

// Send notification email
const sendNotificationEmail = async (notification) => {
  try {
    const transporter = createTransporter();

    // Populate sender and recipient data
    await notification.populate(["sender", "recipient"]);

    if (!notification.recipient || !notification.recipient.email) {
      throw new Error("Recipient email not found");
    }

    // Generate action URL
    const actionUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}${
      notification.actionUrl || "#"
    }`;

    // Get notification type icon and color
    const getNotificationStyle = (type) => {
      const styles = {
        recipe_like: { icon: "❤️", color: "#EF4444" },
        recipe_comment: { icon: "💬", color: "#3B82F6" },
        comment_reply: { icon: "💭", color: "#8B5CF6" },
        recipe_favorite: { icon: "⭐", color: "#F59E0B" },
        user_follow: { icon: "👥", color: "#10B981" },
        collection_follow: { icon: "📚", color: "#6366F1" },
        recipe_published: { icon: "🎉", color: "#059669" },
        recipe_featured: { icon: "⭐", color: "#DC2626" },
        comment_like: { icon: "👍", color: "#06B6D4" },
        system_announcement: { icon: "📢", color: "#EA580C" },
      };
      return styles[type] || { icon: "🔔", color: "#6B7280" };
    };

    const style = getNotificationStyle(notification.type);

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@recipeshare.com",
      to: notification.recipient.email,
      subject: `${style.icon} ${notification.title} - Recipe Share`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #EA580C; margin: 0;">Recipe Share</h1>
            <p style="color: #6B7280; margin: 5px 0;">Lezzetli tariflerin paylaşım platformu</p>
          </div>
          
          <div style="background: #F9FAFB; padding: 30px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid ${
            style.color
          };">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <span style="font-size: 24px; margin-right: 10px;">${
                style.icon
              }</span>
              <h2 style="color: #111827; margin: 0; font-size: 20px;">${
                notification.title
              }</h2>
            </div>
            
            <p style="color: #4B5563; line-height: 1.6; margin-bottom: 20px;">
              Merhaba <strong>${notification.recipient.name}</strong>!
            </p>
            
            <p style="color: #4B5563; line-height: 1.6; margin-bottom: 25px;">
              ${notification.message}
            </p>
            
            ${
              notification.sender && notification.sender.name
                ? `
              <div style="background: #F3F4F6; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="color: #6B7280; margin: 0; font-size: 14px;">
                  <strong>👤 Gönderen:</strong> ${notification.sender.name}
                </p>
              </div>
            `
                : ""
            }
            
            ${
              actionUrl !==
              `${process.env.FRONTEND_URL || "http://localhost:3000"}#`
                ? `
              <div style="text-align: center; margin: 25px 0;">
                <a href="${actionUrl}" 
                   style="display: inline-block; padding: 12px 25px; background: ${style.color}; color: white; 
                          text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Görüntüle
                </a>
              </div>
            `
                : ""
            }
            
            <div style="background: #FEF3C7; padding: 15px; border-radius: 6px; margin-top: 20px;">
              <p style="color: #92400E; margin: 0; font-size: 13px;">
                <strong>📧 Bu bildirim otomatik olarak gönderilmiştir.</strong> 
                Bildirim ayarlarınızı değiştirmek için hesap ayarlarınızı ziyaret edin.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
            <p>Recipe Share - Tarif paylaşım topluluğu</p>
            <p>Bu bildirimi ${new Date().toLocaleString(
              "tr-TR"
            )} tarihinde aldınız.</p>
          </div>
        </div>
      `,
      text: `
        ${style.icon} ${notification.title}
        
        Merhaba ${notification.recipient.name}!
        
        ${notification.message}
        
        ${
          notification.sender && notification.sender.name
            ? `Gönderen: ${notification.sender.name}`
            : ""
        }
        ${
          actionUrl !==
          `${process.env.FRONTEND_URL || "http://localhost:3000"}#`
            ? `\nGörüntülemek için: ${actionUrl}`
            : ""
        }
        
        Bu bildirim ${new Date().toLocaleString(
          "tr-TR"
        )} tarihinde gönderilmiştir.
        
        Recipe Share Ekibi
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `Notification email sent to ${notification.recipient.email} for type: ${notification.type}`
    );
    return true;
  } catch (error) {
    console.error("Error sending notification email:", error);
    return false;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail,
  sendNotificationEmail,
};
