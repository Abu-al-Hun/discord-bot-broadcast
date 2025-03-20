const {
  Client,
  Intents,
  Permissions,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Modal,
  TextInputComponent,
} = require("discord.js");
const config = require("./config.json");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
  partials: ["CHANNEL", "MESSAGE"],
});

const prefix = config.prefix;
const MESSAGE_RATE = 2;
const MESSAGE_DELAY = 1000 / MESSAGE_RATE;

let messageQueue = [];
let isProcessing = false;

client.once("ready", () => {
  console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
  console.log(`🌐 discord.gg/wicks`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "bc") {
    if (!message.member.roles.cache.has(config.adminRole)) {
      return message.reply(
        "❌ عذراً، أنت لا تملك الصلاحيات لاستخدام هذا الأمر."
      );
    }

    const broadcastEmbed = new MessageEmbed()
      .setTitle("🔊 نظام البرودكاست")
      .setDescription("اختر نوع البرودكاست الذي تريد إرساله:")
      .setColor("#0099ff")
      .setImage(config.embedImage)
      .setTimestamp();

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("broadcast-all")
        .setLabel("إرسال للجميع")
        .setStyle("PRIMARY")
        .setEmoji("📢"),
      new MessageButton()
        .setCustomId("broadcast-online")
        .setLabel("إرسال للمتصلين")
        .setStyle("SUCCESS")
        .setEmoji("🟢"),
      new MessageButton()
        .setCustomId("broadcast-offline")
        .setLabel("إرسال للغير متصلين")
        .setStyle("DANGER")
        .setEmoji("⭕"),
      new MessageButton()
        .setCustomId("broadcast-specific")
        .setLabel("إرسال لشخص معين")
        .setStyle("SECONDARY")
        .setEmoji("👤")
    );

    await message.channel.send({
      embeds: [broadcastEmbed],
      components: [row],
    });
  }
});

async function processMessageQueue() {
  if (isProcessing || messageQueue.length === 0) return;

  isProcessing = true;
  const currentTask = messageQueue.shift();
  const { members, message, interaction } = currentTask;

  const thread = await interaction.channel.threads.create({
    name: `📢 إرسال برودكاست`,
    autoArchiveDuration: 60,
  });

  for (const member of members) {
    if (!member.user.bot) {
      await sendMessage(member, message, thread);
      await new Promise((resolve) => setTimeout(resolve, MESSAGE_DELAY));
    }
  }

  await thread.send({
    embeds: [
      new MessageEmbed().setColor("#00ff00").setTitle("✅ اكتمل البرودكاست"),
    ],
  });

  isProcessing = false;
  if (messageQueue.length > 0) processMessageQueue();
}

async function processMessageQueue() {
  if (isProcessing || messageQueue.length === 0) return;

  isProcessing = true;
  const currentTask = messageQueue[0];

  const members = currentTask.members;
  const message = currentTask.message;
  const interaction = currentTask.interaction;
  let sent = 0;
  let closed = 0;

  const totalMembers = members.length;
  const estimatedTime = (totalMembers / MESSAGE_RATE).toFixed(2);

  const thread = await interaction.channel.threads.create({
    name: `📢 إرسال برودكاست`,
    autoArchiveDuration: 60,
    reason: "إرسال رسائل البث المباشر",
  });

  await thread.send(`⏳ الوقت المتوقع لإتمام الإرسال: ${estimatedTime} ثانية`);

  for (const member of members) {
    try {
      await member.send(`${member.user}\n${message}`);
      sent++;
      await thread.send(`✅ تم الإرسال إلى: ${member.user.tag}`);
    } catch (error) {
      if (error.code === 50007) {
        closed++;
        await thread.send(`⚠️ خاص مغلق: ${member.user.tag}`);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, MESSAGE_DELAY));
  }

  const finalEmbed = new MessageEmbed()
    .setColor("#00ff00")
    .setTitle("✅ اكتمل البرودكاست")
    .setDescription(
      `تم إرسال الرسالة بنجاح!\n\nتم الإرسال: ${sent}\nخاص مغلق: ${closed}`
    );

  await thread.send({ embeds: [finalEmbed] });

  messageQueue.shift();
  isProcessing = false;
  if (messageQueue.length > 0) processMessageQueue();
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const { customId } = interaction;

  if (customId.startsWith("broadcast-")) {
    if (!interaction.member.roles.cache.has(config.adminRole)) {
      await interaction.reply({
        content: "❌ عذراً، أنت لا تملك الصلاحيات لاستخدام هذا الأمر.",
        ephemeral: true,
      });
      return;
    }

    if (customId === "broadcast-specific") {
      const userModal = new Modal()
        .setCustomId("user-modal")
        .setTitle("إدخال معرف المستخدم والرسالة");

      const userIdInput = new TextInputComponent()
        .setCustomId("userId")
        .setLabel("معرف المستخدم (ID)")
        .setStyle("SHORT")
        .setPlaceholder("أدخل معرف المستخدم هنا")
        .setRequired(true);

      const messageInput = new TextInputComponent()
        .setCustomId("message")
        .setLabel("الرسالة")
        .setStyle("PARAGRAPH")
        .setPlaceholder("اكتب رسالتك هنا")
        .setMaxLength(2000)
        .setRequired(true);

      const firstRow = new MessageActionRow().addComponents(userIdInput);
      const secondRow = new MessageActionRow().addComponents(messageInput);

      userModal.addComponents(firstRow, secondRow);
      await interaction.showModal(userModal);
    } else {
      const modal = new Modal()
        .setCustomId(`modal-${customId}`)
        .setTitle("كتابة رسالة البرودكاست");

      const messageInput = new TextInputComponent()
        .setCustomId("message")
        .setLabel("الرسالة")
        .setStyle("PARAGRAPH")
        .setPlaceholder("اكتب رسالتك هنا")
        .setMaxLength(2000)
        .setRequired(true);

      const row = new MessageActionRow().addComponents(messageInput);
      modal.addComponents(row);
      await interaction.showModal(modal);
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  try {
    const { customId } = interaction;
    const message = interaction.fields.getTextInputValue("message");

    await interaction.deferReply({ ephemeral: true });

    const members = await interaction.guild.members.fetch();
    let targetMembers = [];

    if (customId === "modal-broadcast-all") {
      targetMembers = Array.from(members.values()).filter(
        (member) => !member.user.bot
      );
    } else if (customId === "modal-broadcast-online") {
      targetMembers = Array.from(members.values()).filter((member) => {
        const status = member.presence?.status;
        return (
          !member.user.bot &&
          (status === "online" || status === "dnd" || status === "idle")
        );
      });
    } else if (customId === "modal-broadcast-offline") {
      targetMembers = Array.from(members.values()).filter((member) => {
        const status = member.presence?.status;
        return !member.user.bot && (!status || status === "offline");
      });
    } else if (customId === "user-modal") {
      const userId = interaction.fields.getTextInputValue("userId");
      const targetMember = members.get(userId);

      if (!targetMember) {
        await interaction.editReply("❌ لم يتم العثور على المستخدم المحدد.");
        return;
      }

      targetMembers = [targetMember];
    }

    if (targetMembers.length === 0) {
      await interaction.editReply("❌ لا يوجد أعضاء مستهدفين للإرسال.");
      return;
    }

    messageQueue.push({
      members: targetMembers,
      message: message,
      interaction: interaction,
    });

    if (messageQueue.length > 1) {
      await interaction.editReply("⏳ تم إضافة البرودكاست إلى قائمة الانتظار.");
    } else {
      processMessageQueue();
    }
  } catch (error) {
    console.error("Error in modal submission:", error);
    await interaction.editReply({
      content: "❌ حدث خطأ أثناء معالجة طلبك. الرجاء المحاولة مرة أخرى.",
      ephemeral: true,
    });
  }
});

client.login(config.TOKEN);
