/**
 * MASTER CARDIOLOGY 23-CLASS FULL DATASET (MODULAR COMPILATION)
 * 100% Chilean EUNACOM Official Standard & GES Clinical Guidelines 2026
 */

const b1 = require('./dataset_bloque_1.cjs');
const b2 = require('./dataset_bloque_2.cjs');
const b3 = require('./dataset_bloque_3.cjs');
const b4 = require('./dataset_bloque_4.cjs');
const b5 = require('./dataset_bloque_5.cjs');

const master23ClassesFullData = [
  ...b1.bloque1,
  ...b2.bloque2,
  ...b3.bloque3,
  ...b4.bloque4,
  ...b5.bloque5
];

module.exports = { master23ClassesFullData };
