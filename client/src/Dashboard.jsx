useEffect(() => {
  const fetchBoards = async () => {
    const res = await API.get("/api/boards");
    setBoards(res.data);
  };
  fetchBoards();
}, []);
