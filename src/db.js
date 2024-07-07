const { DB, DBHOST, DBPASS, DBUSER } = require("./constants");
const Sequelize = require("sequelize");

const AdminModel = require("./models/admin.js");
const UserModel = require("./models/user.js");
const SettingModel = require("./models/setting.js");
// const SwarmModel = require("./models/swarm.js");
// const UserSwarmModel = require("./models/userswarm.js");
const TwitterModel = require("./models/twitter.js");
const SwarmV2Model = require("./models/swarmv2.js");
const UserSwarmV2Model = require("./models/userswarmv2.js");
const ScheduleMessageModel = require("./models/scheduleMessage.js");
const ProblemModel = require("./models/problem.js");

const sequelize = new Sequelize(DB, DBUSER, DBPASS, {
  host: DBHOST,
  dialect: "postgres",
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: false,
});

const Admin = AdminModel(sequelize, Sequelize);
const User = UserModel(sequelize, Sequelize);
const Setting = SettingModel(sequelize, Sequelize);
const Swarm = SwarmV2Model(sequelize, Sequelize);
const Twitter = TwitterModel(sequelize, Sequelize);
const UserSwarm = UserSwarmV2Model(sequelize, Sequelize);
const ScheduleMessage = ScheduleMessageModel(sequelize, Sequelize);
const Problem = ProblemModel(sequelize, Sequelize);
User.hasMany(UserSwarm, { foreignKey: "userId" });
UserSwarm.belongsTo(User, { foreignKey: "userId" });
User.hasOne(Twitter, { foreignKey: "userId" });
Twitter.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  sequelize,
  Admin,
  User,
  Setting,
  Swarm,
  UserSwarm,
  Twitter,
  ScheduleMessage,
  Problem
};
