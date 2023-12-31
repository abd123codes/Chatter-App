import { useState, useEffect } from 'react'
import { NavMenu } from '../components/nav&search/navigation-menu'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import Showdown from 'showdown'
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db, auth } from '../firebase/Firebase'
import { SearchBar } from '../components/nav&search/search-bar'
import { onAuthStateChanged } from 'firebase/auth'
import userProfileImg from '../assets/images/nav&search/userProfileImg.png'

export const BlogPostCreator = () => {
  const [content, setContent] = useState<string>('')
  const converter = new Showdown.Converter()

  const handleContentChange = (value: string) => {
    setContent(value)
  }
  //converting to "markdownContent" & saving to fire-store
  const saveContentInMarkdown = () => {
    const markdownContent = converter.makeMarkdown(content)
    console.log(markdownContent)
    addAndReadDocs(markdownContent).catch((err) => {
      console.log(err)
    })
  }

  //function to save in fireStore
  async function addAndReadDocs(savedContent: string) {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('User not signed in.')
      }

      const collectionID = user.uid

      const userCollectionRef = collection(db, collectionID)
      const newDocRef = await addDoc(userCollectionRef, {
        userId: user.uid,
        name: user.displayName,
        contentType: 'blogPost',
        blogPost: savedContent,
        timeStamp: serverTimestamp(),
        date: new Date()
      })
      // the ID of the newly added document
      console.log('Document written with ID:', newDocRef.id)
    } catch (error) {
      console.error(error)
    }
  }

  const [profilePic, setProfilePic] = useState('')
  const [userID, setUserID] = useState<string | undefined>('')
   const [search, setSearch] = useState('')

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (typeof user?.photoURL === 'string') {
        setProfilePic(user?.photoURL)
      } else setProfilePic(userProfileImg)
      setUserID(user?.uid)
    })
  }, [userID])

  //word counter
  const wordCount = content.trim().split(/\s+/).length

  return (
    <div className='flex flex-row'>
      <NavMenu />
      <div>
        <SearchBar profilePic={profilePic} search={search} onSearchChange={setSearch} />
        <ReactQuill
          value={content}
          onChange={handleContentChange}
          modules={BlogPostCreator.modules}
          formats={BlogPostCreator.formats}
          placeholder='Write your content here...'
        />
        <div>Word Count: {wordCount}</div>
        <button
          onClick={() => {
            saveContentInMarkdown()
          }}
        >
          Save as Markdown
        </button>
      </div>
    </div>
  )
}

BlogPostCreator.modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }], // Add alignment options
    [{ color: [] }, { background: [] }], // Add text color and background color options
    ['link', 'image'],
    ['clean'],
    [{ script: 'sub' }, { script: 'super' }], // Add subscript and superscript options
    [{ indent: '-1' }, { indent: '+1' }], // Add indentation options
    [{ direction: 'rtl' }], // Add right-to-left text direction option
    [{ size: ['small', false, 'large', 'huge'] }], // Add font size options
    [
      { header: 1 },
      { header: 2 },
      { header: 3 },
      { header: 4 },
      { header: 5 },
      { header: 6 },
      { header: false },
    ], // Add multiple header sizes
    ['video'], // Add video embedding option
    ['code', { language: 'javascript' }], // Add code syntax highlighting for JavaScript
  ],

  clipboard: {
    //Add a clean clipboard to strip out unsupported formatting when pasting content
    matchVisual: false,
  },
}

BlogPostCreator.formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'code-block',
  'list',
  'bullet',
  'align', //Add alignment format
  'color',
  'background', //Add text color and background color formats
  'link',
  'image',
  'clean',
  'script', // Add subscript and superscript formats
  'indent', // Add indentation format
  'direction', // Add right-to-left text direction format
  'size', // Add font size format
  'video', // Add video embedding format
  'code', // Add code format
]
