// Header component holds buttons to manage application state
const Header = () => {
  return (
    <div className="header">
      <button className="header__button" >
        Save Revision
      </button>
      <button className="header__button" >
        Reset Revision
      </button>
      <button className="header__button" >
        Load Revision
      </button>
    </div>
  );
};

export default Header;