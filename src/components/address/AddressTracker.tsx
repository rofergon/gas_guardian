import { useState, useEffect } from 'react';
import { ExternalLink, Trash2, Plus, Edit2, Check, X } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface TrackedAddress {
  address: string;
  nickname: string;
  value: string;
}

export default function AddressTracker() {
  const { isDark } = useTheme();
  const [addresses, setAddresses] = useState<TrackedAddress[]>(() => {
    const saved = localStorage.getItem('trackedAddresses');
    const parsedSaved = saved ? JSON.parse(saved) : null;
    
    // Only use saved data if it exists AND has at least one element
    if (parsedSaved && parsedSaved.length > 0) return parsedSaved;
    
    // If there's no saved data, use example data
    return [
      {
        address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        nickname: "Vitalik",
        value: "1,234.56"
      },
      {
        address: "0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990",
        nickname: "Wallet Demo",
        value: "42.69"
      },
      {
        address: "0x829BD824B016326A401d083B33D092293333A830",
        nickname: "Test Wallet",
        value: "0.0125"
      }
    ];
  });
  const [newAddress, setNewAddress] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [editingNickname, setEditingNickname] = useState('');

  useEffect(() => {
    localStorage.setItem('trackedAddresses', JSON.stringify(addresses));
  }, [addresses]);

  const addAddress = () => {
    if (!newAddress || !newAddress.startsWith('0x')) return;
    
    setAddresses(prev => [...prev, {
      address: newAddress,
      nickname: newNickname || newAddress.substring(0, 6) + '...' + newAddress.substring(38),
      value: '---'
    }]);
    setNewAddress('');
    setNewNickname('');
  };

  const removeAddress = (addressToRemove: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setAddresses(prev => prev.filter(a => a.address !== addressToRemove));
    }
  };

  const openEtherscan = (address: string) => {
    window.open(`https://etherscan.io/address/${address}`, '_blank');
  };

  const startEditing = (address: string, currentNickname: string) => {
    setEditingAddress(address);
    setEditingNickname(currentNickname);
  };

  const saveNickname = () => {
    if (!editingAddress) return;
    
    setAddresses(prev => prev.map(addr => 
      addr.address === editingAddress 
        ? { ...addr, nickname: editingNickname || addr.address.substring(0, 6) + '...' + addr.address.substring(38) }
        : addr
    ));
    setEditingAddress(null);
    setEditingNickname('');
  };

  const cancelEditing = () => {
    setEditingAddress(null);
    setEditingNickname('');
  };

  return (
    <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl p-6 shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Address Tracker</h2>
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <label className="flex-1">
          <span className="sr-only">ETH Address</span>
          <input
            type="text"
            placeholder="ETH Address (0x...)"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            className={`w-full px-3 py-2 text-sm rounded-lg ${
              isDark 
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'
            }`}
          />
        </label>
        <label>
          <span className="sr-only">Nickname</span>
          <input
            type="text"
            placeholder="Nickname (optional)"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
            className={`w-32 px-3 py-2 text-sm rounded-lg ${
              isDark 
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500'
            }`}
          />
        </label>
        <button
          onClick={addAddress}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          title="Add address"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-2">
        {addresses.length === 0 ? (
          <div className={`text-center py-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            No saved addresses
          </div>
        ) : (
          addresses.map((item) => (
            <div
              key={item.address}
              className={`flex items-center justify-between p-3 rounded-lg ${
                isDark 
                  ? 'bg-slate-700/50 hover:bg-slate-700' 
                  : 'bg-slate-50 hover:bg-slate-100'
              } transition-colors`}
            >
              <div className="flex-1 flex items-center gap-4">
                <div className="flex-1">
                  {editingAddress === item.address ? (
                    <input
                      type="text"
                      value={editingNickname}
                      onChange={(e) => setEditingNickname(e.target.value)}
                      className={`px-2 py-1 rounded text-sm ${
                        isDark 
                          ? 'bg-slate-600 text-white' 
                          : 'bg-white text-slate-900'
                      }`}
                      autoFocus
                    />
                  ) : (
                    <div
                      onClick={() => openEtherscan(item.address)}
                      className="cursor-pointer hover:text-blue-500 flex items-center"
                    >
                      <span className="font-medium">{item.nickname}</span>
                      <span className={`text-sm ml-2 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        ({item.address.substring(0, 6)}...{item.address.substring(38)})
                      </span>
                      <ExternalLink size={14} className="ml-2 opacity-50" />
                    </div>
                  )}
                </div>
                
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {item.value} ETH
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {editingAddress === item.address ? (
                  <>
                    <button
                      onClick={saveNickname}
                      className="text-green-500 hover:text-green-600 p-1"
                      title="Save changes"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="text-red-500 hover:text-red-600 p-1"
                      title="Cancel editing"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEditing(item.address, item.nickname)}
                      className="text-blue-500 hover:text-blue-600 p-1"
                      title="Edit nickname"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => removeAddress(item.address)}
                      className="text-red-500 hover:text-red-600 p-1"
                      title="Delete address"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 