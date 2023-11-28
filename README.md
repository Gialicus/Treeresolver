# TreeRex

example:

```
import { Tree, TreeRex } from 'treerex';

const cto = new Tree<string>("CTO");
const architect1 = new Tree<string>("ARCHITECT_1");
const architect2 = new Tree<string>("ARCHITECT_2");
const dev1 = new Tree<string>("DEV_1");
const dev2 = new Tree<string>("DEV_2");
const dev3 = new Tree<string>("DEV_3");
const dev4 = new Tree<string>("DEV_4");
const dev5 = new Tree<string>("DEV_5");
const dev6 = new Tree<string>("DEV_6");

architect1
  .add(dev1)
  .add(dev2)
  .add(dev3);
architect2
  .add(dev4)
  .add(dev5)
  .add(dev6);
cto
  .add(architect1)
  .add(architect2);

const rex = new TreeRex<string>(cto);

const run = async () => {
  await rex.resolveAll(async (id) => {
      return `Long operation with ID: ${id}`;
    });
};

run().then(() => {
  console.log(rex.pretty())
/*
|(CTO) -> "Long operation with ID: CTO"
|__(ARCHITECT_1) -> "Long operation with ID: ARCHITECT_1"
|____(DEV_1) -> "Long operation with ID: DEV_1"
|____(DEV_2) -> "Long operation with ID: DEV_2"
|____(DEV_3) -> "Long operation with ID: DEV_3"
|__(ARCHITECT_2) -> "Long operation with ID: ARCHITECT_2"
|____(DEV_4) -> "Long operation with ID: DEV_4"
|____(DEV_5) -> "Long operation with ID: DEV_5"
|____(DEV_6) -> "Long operation with ID: DEV_6"
*/
});

```

```
import { Tree, TreeRex } from 'treerex';

const cto = new Tree<string>("CTO");
const architect1 = new Tree<string>("ARCHITECT_1");
const architect2 = new Tree<string>("ARCHITECT_2");
const dev1 = new Tree<string>("DEV_1");
const dev2 = new Tree<string>("DEV_2");
const dev3 = new Tree<string>("DEV_3");
const dev4 = new Tree<string>("DEV_4");
const dev5 = new Tree<string>("DEV_5");
const dev6 = new Tree<string>("DEV_6");

architect1
  .add(dev1)
  .add(dev2)
  .add(dev3);
architect2
  .add(dev4)
  .add(dev5)
  .add(dev6);
cto
  .add(architect1)
  .add(architect2);

const run = async () => {
  const rex = new TreeRex<string>(cto);
  const stepper = rex.resolveLayer(async (id) => {
    await setTimeout(200);
    return `Long operation with ID: ${id}`;
  });
  await stepper.next();
  console.log(rex.pretty())
/*
|(CTO) -> "Long operation with ID: CTO"
|__(ARCHITECT_1)
|____(DEV_1)
|____(DEV_2)
|____(DEV_3)
|__(ARCHITECT_2)
|____(DEV_4)
|____(DEV_5)
|____(DEV_6)
*/
  await stepper.next();
  console.log(rex.pretty())
/*
|(CTO) -> "Long operation with ID: CTO"
|__(ARCHITECT_1) -> "Long operation with ID: ARCHITECT_1"
|____(DEV_1)
|____(DEV_2)
|____(DEV_3)
|__(ARCHITECT_2) -> "Long operation with ID: ARCHITECT_2"
|____(DEV_4)
|____(DEV_5)
|____(DEV_6)
*/
  await stepper.next();
  console.log(rex.pretty())
/*
|(CTO) -> "Long operation with ID: CTO"
|__(ARCHITECT_1) -> "Long operation with ID: ARCHITECT_1"
|____(DEV_1) -> "Long operation with ID: DEV_1"
|____(DEV_2) -> "Long operation with ID: DEV_2"
|____(DEV_3) -> "Long operation with ID: DEV_3"
|__(ARCHITECT_2) -> "Long operation with ID: ARCHITECT_2"
|____(DEV_4) -> "Long operation with ID: DEV_4"
|____(DEV_5) -> "Long operation with ID: DEV_5"
|____(DEV_6) -> "Long operation with ID: DEV_6"
*/
}
```
