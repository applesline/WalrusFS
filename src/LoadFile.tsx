import { 
    useSuiClientQuery,
  } from '@mysten/dapp-kit'
import {useEffect, useRef, useState} from 'react'
import fileImg from "./assets/img/file.png"
import folderImg from "./assets/img/folder.png"
const WALRUS_AGGREGATOR = "https://aggregator-devnet.walrus.space";
const PackageId = "0x7a59511f38e563ea32995d2c22f340cb6c29885269dd1adecb533c1c13525688";
const Module = "file_system";

export function LoadFile({objectId,setHasRootDir,setCurrentDirectoryId}) {
    const [showMenu,setShowMenu] = useState(false);
    const contextMenuRef = useRef(null)
    const {data} = useSuiClientQuery("getObject",{id:objectId,options:  {"showContent":true}});
  
    const handleContextMenu = (event) => {
      event.preventDefault();
      setShowMenu(true);
    }
    useEffect(()=>{
      const handleClickOutside = (event) => {
        if(contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
          setShowMenu(false);
        }
      }
      document.addEventListener("mousedown",handleClickOutside);
      return () => {
        document.removeEventListener("mousedown",handleClickOutside);
      }
    },[showMenu])
  
    const handleDownload = async (completedUrl,fileName) => {
      // setIsLoading(true);
      try {
        const response = await fetch(completedUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName); // 设置下载文件名
        document.body.appendChild(link);
        link.click();
        // 清除 URL 对象
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download error', error);
      } finally {
        // setIsLoading(false);
      }
    };
    console.log(JSON.stringify(data?.data?.content))
    if(!data) {
      return null;
    }
    // 判断是文件系统的对象
    //@ts-ignore
    // 判断是系统目录
    if(data?.data?.content?.type === `${PackageId}::${Module}::Directory`) {
      // @ts-ignore
      if(data?.data?.content?.fields.name === "/") {
        // 存在根目录
        setHasRootDir(true);
        setCurrentDirectoryId(data?.data?.objectId)
        console.log("root_directory=" + data?.data?.objectId)
        return (<span></span>);
      } else {
        return (
          <div className="file">
            <div className="icon folder" onContextMenu={handleContextMenu}  ref={contextMenuRef}>
              {showMenu && 
                (
                  <div className='right-click-popup-context-menu'>
                    <ul className='right-clik-popup'>
                      <li onClick={()=>{
                      }}>Open Directory</li>
                      <li>Rename</li>
                    </ul>
                  </div>
                )
              }
              <img src={folderImg} className="folder_img"/>
            </div>
            <span className="filename">
              {//@ts-ignore 
              data?.data?.content?.fields.name}
            </span>
          </div>
        ) 
      }
        //@ts-ignore  文件
    } else if(data?.data?.content?.type === `${PackageId}::${Module}::File`) {
      return (
        // <li>
          <div className="file">
            <div className="icon file" onContextMenu={handleContextMenu} ref={contextMenuRef}>
              {showMenu && 
                (
                  <div className='right-click-popup-context-menu'>
                  <ul>
                    <li className='right-clik-popup' onClick={()=>{
                      //@ts-ignore
                        let url = WALRUS_AGGREGATOR + "/v1/" + data?.data?.content?.fields.blob_id;
                        //@ts-ignore
                        let fileName = data?.data?.content?.fields.name || "default.txt";
                        handleDownload(url,fileName);
                      }}>Download File</li>
                  </ul>
                </div>
                )
              }
              <img src={fileImg} className="file_img"/>
            </div>
            <span className="filename">
              {//@ts-ignore
            data?.data?.content?.fields.name
            }</span>
          </div>
        // </li>
        )
    }
  }