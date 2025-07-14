


navigate(`/board/${boardId}`);

useEffect(() => {
  const fetchTasks = async () => {
    const res = await API.get(`/api/tasks?boardId=${boardId}`);
    setTasks(res.data);
  };
  fetchTasks();
}, [boardId]);