const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "seth@endevrs.dev",
    subject: "Welcome to the Task Manager App!",
    text: `Hello ${name}! Thanks for signing up for the application, we very much hope you enjoy your time here!`,
  });
};

const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "seth@endevrs.dev",
    subject: "We're sorry to see you go :(",
    text: `Goodbye ${name}... Is there anything we could have done to get you to stay?`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail,
};
