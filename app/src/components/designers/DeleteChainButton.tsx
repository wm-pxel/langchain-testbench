import QuickMenu from "../QuickMenu"

const DeleteChainButton = ({ onDelete, modalKey }: { onDelete: () => void, modalKey: string }) => <QuickMenu
  modalKey={modalKey}
  menuClass="delete-spec"
  options={{ cancel: 'cancel', delete: 'delete' }}
  selectValue={(option: string) => {if (option === 'delete') onDelete()}}
  buttonText="x"/>

export default DeleteChainButton