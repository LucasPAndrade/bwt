import email from "infra/email.js";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "Test <test@myemail.com>",
      to: "MyRecipient <recipient@myemail.com>",
      subject: "1st Test Email",
      text: "This is a test email sent from the email module.",
    });

    await email.send({
      from: "Test <test@myemail.com>",
      to: "MyRecipient <recipient@myemail.com>",
      subject: "Latest sent email",
      text: "This is the email body from the latest test sent from the email module.",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<test@myemail.com>");
    expect(lastEmail.recipients[0]).toBe("<recipient@myemail.com>");
    expect(lastEmail.subject).toBe("Latest sent email");
    expect(lastEmail.text).toBe(
      "This is the email body from the latest test sent from the email module.\n",
    );
  });
});
