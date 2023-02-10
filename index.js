const db = require('./db.js')
const inquirer = require('inquirer')

module.exports.add = async title => {
  //步骤
  //读取之前的任务
  const list = await db.read()
  //往里面添加一个任务
  list.push({ title, done: false })
  //存储任务到文件
  await db.write(list)
}

module.exports.clear = async () => {
  await db.write([])
}

function updateTitle (list, index) {
  inquirer
    .prompt({
      type: 'input',
      name: 'title',
      message: '新的标题',
      default: list[index].title
    })
    .then(answer => {
      list[index].title = answer.title
      db.write(list)
    })
}
function markAsDone (list, index) {
  list[index].done = true
  db.write(list)
}
function markAsUnDone (list, index) {
  list[index].done = false
  db.write(list)
}
function remove (list, index) {
  list.splice(index, 1)
  db.write(list)
}

function askForAction (list, index) {
  const actions = { updateTitle, markAsDone, markAsUnDone, remove }
  inquirer
    .prompt({
      type: 'list',
      name: 'action',
      message: '请选择操作',
      choices: [
        { name: '改标题', value: 'updateTitle' },
        { name: '已完成', value: 'markAsDone' },
        { name: '未完成', value: 'markAsUndone' },
        { name: '删除', value: 'remove' },
        { name: '退出', value: 'quit' }
      ]
    })
    .then(answer2 => {
      const action = actions[answer2.action]
      action && action(list, index)
    })
}
function askForCreateTask (list) {
  inquirer
    .prompt({
      type: 'input',
      name: 'title',
      message: '输入任务标题'
    })
    .then(answer => {
      list.push({
        title: answer.title,
        done: false
      })
      db.write(list)
    })
}

function printTasks (list) {
  inquirer
    .prompt({
      type: 'list',
      name: 'index',
      message: '请选择你要操作的任务',
      choices: [
        { name: ' + 新建任务', value: '-1' },
        ...list.map((task, index) => {
          return {
            name: `${task.done ? '[x]' : '[_]'} ${index + 1} -- ${task.title}`,
            value: index.toString()
          }
        }),
        { name: '退出', value: '-2' }
      ]
    })
    .then(answer => {
      const index = parseInt(answer.index)
      if (index >= 0) {
        //选中了一个任务
        askForAction(list, index)
      } else if (index === -1) {
        //新建任务
        askForCreateTask(list)
      }
    })
}

module.exports.showAll = async () => {
  // 读取之前的任务
  const list = await db.read()
  //    打印之前的任务
  printTasks(list)
}
