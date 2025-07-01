// import React, { useEffect, useState } from 'react';
//
// const Avatar = () => {
//     const [avatarUrl, setAvatarUrl] = useState('');
//
//     useEffect(() => {
//         const params = new URLSearchParams(window.location.search);
//         const url = params.get('url');
//         if (url) setAvatarUrl(url);
//     }, []);
//
//     return (
//         <div style={{ textAlign: 'center', marginTop: '20px' }}>
//             {avatarUrl ? (
//                 <img
//                     src={avatarUrl}
//                     alt="Instagram Avatar"
//                     style={{
//                         width: '120px',
//                         height: '120px',
//                         borderRadius: '50%',
//                         objectFit: 'cover',
//                         border: '2px solid #ccc'
//                     }}
//                 />
//             ) : (
//                 <p>Аватар не загружен</p>
//             )}
//         </div>
//     );
// };
//
// export default Avatar;
