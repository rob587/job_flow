import React from "react";

const SearchBar = () => {
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!keywords.trim()) return;

    onSearch({
      keywords,
      location,
      remoteOnly,
      jobType: "full-time",
    });
  };
  return <div>SearchBar</div>;
};

export default SearchBar;
