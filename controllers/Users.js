import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const getUser = async (req, res) => {
  try {
    const user = await Users.findOne(
      { _id: req.userId },
      { refreshToken: 0, password: 0 },
    );
    res.json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const register = async (req, res) => {
  const { username, nama, email, password, confPassword } = req.body;

  // if password and confirm is not same
  if (password !== confPassword) {
    return res
      .status(400)
      .json({ msg: "Password dan confirm password tidak cocok!" });
  }
  const hashPassword = bcrypt.hashSync(password, 10);
  try {
    await Users.create({
      nama: nama,
      username: username,
      email,
      password: hashPassword,
    });
    res.json({ msg: "Register Berhasil!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ msg: "Email tidak ditemukan" });
    }

    const match = bcrypt.compareSync(req.body.password, user.password);

    if (!match) {
      return res.status(400).json({ msg: "Password salah" });
    }

    const userId = user._id.toString();
    const name = user.name;
    const username = user.username;
    const email = user.email;

    const accessToken = jwt.sign(
      { userId, name, username, email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.json({ accessToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Fungsi untuk mengirim email reset password
const sendPasswordResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Password",
    html: `
      <p>Hello,</p>
      <p>You requested a password reset. Please click this <a href="${process.env.CLIENT_URL}/reset/${token}">link</a> to reset your password.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "Email not found" });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.RESET_TOKEN_SECRET,
      {
        expiresIn: "15m",
      },
    );

    // Send email with reset token
    await sendPasswordResetEmail(email, resetToken);

    res.json({ msg: "Email sent with password reset instructions" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Fungsi untuk mengecek validitas token reset password
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token)
      return res.status(401).json({ msg: "No token, authorization denied" });

    jwt.verify(token, process.env.RESET_TOKEN_SECRET, async (err, decoded) => {
      if (err)
        return res.status(403).json({ msg: "Invalid token, please try again" });

      res.json({ msg: "Token verified", isValid: true });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Fungsi untuk update password terbaru
export const updatePassword = async (req, res) => {
  try {
    const { newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, process.env.RESET_TOKEN_SECRET, async (err, decoded) => {
      if (err)
        return res.status(403).json({ msg: "Invalid token, please try again" });

      const user = await Users.findById(decoded.id);
      if (!user) return res.status(404).json({ msg: "User not found" });

      const hashPassword = bcrypt.hashSync(newPassword, 10);
      await Users.findByIdAndUpdate(decoded.id, { password: hashPassword });

      res.json({ msg: "Password updated successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};
