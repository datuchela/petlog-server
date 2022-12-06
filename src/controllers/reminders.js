const { db } = require("../db");
const asyncWrapper = require("../middleware/asyncWrapper");

const addReminder = asyncWrapper(async (req, res) => {
  if (
    !req.body ||
    !req.body.petId ||
    !req.body.name ||
    !req.body.upcoming ||
    !req.body.intervalValue ||
    req.body.intervalType === null
  ) {
    console.log(req.body);
    return res.status(400).json({ msg: "Some values are empty." });
  }
  const userId = req.userId;
  try {
    const pet = await db.pet.findFirst({
      where: {
        ownerId: userId,
        id: parseInt(req.body.petId),
      },
    });
    if (!pet) return res.status(404).json({ msg: "Not found" });

    try {
      const date = await db.date.upsert({
        where: {
          date: req.body.upcoming,
        },
        update: {
          date: req.body.upcoming,
        },
        create: {
          date: req.body.upcoming,
        },
      });
      console.log(date);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Error creating date" });
    }

    const reminder = await db.reminder.create({
      data: {
        name: req.body.name,
        upcoming: req.body.upcoming,
        intervalValue: parseInt(req.body.intervalValue),
        intervalType: parseInt(req.body.intervalType),
        petId: pet.id,
        userId: userId,
      },
    });
    return res.status(201).json({ reminder: reminder });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Something went wrong with db" });
  }
});

const deleteReminder = asyncWrapper(async (req, res) => {
  const userId = parseInt(req.userId);
  const reminderId = parseInt(req.params.reminderId);
  try {
    const reminder = await db.reminder.findFirst({
      where: {
        id: reminderId,
        userId: userId,
      },
    });

    if (!reminder)
      return res.status(404).json({
        msg: "Reminder not found or you are not authorized",
      });

    await db.reminder.delete({
      where: {
        id: reminderId,
      },
    });

    return res
      .status(200)
      .json({ msg: "Reminder has been deleted successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Something went wrong with db" });
  }
});

module.exports = { addReminder, deleteReminder };
