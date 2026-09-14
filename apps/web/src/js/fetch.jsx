export async function fetchPost(query = ''){
  const res = await fetch(`http://localhost:4100/posts/?id=${query}`) // GET
  const post = await res.json();
  return post[0]
}
export async function fetchComment(query = ''){
  const res = await fetch(`http://localhost:4100/comments/?postsId=${query}`) // GET
  const comments = await res.json()
  return comments
}
export async function fetchList(query = ''){
    const res = await fetch(`http://localhost:4100/posts/?_embed=comments&_page=${query}`)
    const list = await res.json();
    return list;
}