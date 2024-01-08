import React from "react";
import PropTypes from "prop-types";
import Avatar from "./Avatar";

function Contact({ id, username, onClick, selected, online }) {
  return (
    <React.StrictMode>
      <div
        key={id}
        onClick={() => onClick(id)}
        className={
          "border-b border-blue-200 px-2 py-2 flex items-center gap-2 " +
          (selected ? "bg-blue-300" : "")
        }>
        {selected && <div className="w-1 bg-blue-600 h-12 rounded-md"></div>}
        <Avatar online={online} username={username} userId={id} />
        <span className="text-gray-800">{username}</span>
      </div>
    </React.StrictMode>
  );
}

Contact.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  username: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  selected: PropTypes.bool,
  online: PropTypes.bool,
};

export default Contact;
