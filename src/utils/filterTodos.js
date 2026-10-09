// คืนรายการใหม่เสมอ เพื่อให้ค้นหา/เรียงลำดับโดยไม่เปลี่ยนข้อมูลต้นฉบับ
export function filterTodos(todos, query = '', status = 'all', sort = 'newest') {
  const keyword = query.trim().toLocaleLowerCase()
  const result = todos.filter(todo =>
    todo.text.toLocaleLowerCase().includes(keyword) &&
    (status === 'done' ? todo.done : status === 'pending' ? !todo.done : true)
  )
  const time = todo => Date.parse(todo.createdAt) || 0
  if (sort === 'name') result.sort((a, b) => a.text.localeCompare(b.text, 'th', { sensitivity: 'base' }))
  else if (sort === 'oldest') result.sort((a, b) => time(a) - time(b))
  else result.sort((a, b) => time(b) - time(a))
  return result
}
