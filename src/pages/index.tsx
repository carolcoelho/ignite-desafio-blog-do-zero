import { GetStaticProps } from 'next';
import Link from 'next/link'
import Head from 'next/head'
import Header from '../components/Header';


import Prismic from "@prismicio/client"
import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from "react-icons/fi";
import { formatDate } from '../utils';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination: { next_page, results } }: HomeProps) {
  const [nextPage, setNextPage] = useState<string>(next_page)
  const [posts, setPosts] = useState<Post[]>(results)


  async function handleLoadMorePosts(): Promise<void> {
    const showNewPosts = await fetch(nextPage).then(response =>
      response.json()
    );

    setNextPage(showNewPosts.next_page);
    setPosts([...posts, ...showNewPosts.results])

  }
  return (
    <>
      <Head>
        <title> Home | spacetraveling</title>
      </Head>

      <Header />

      <main className={commonStyles.container} >

        <div className={styles.posts}>

          {posts.map(p =>
            <Link href={`/post/${p.uid}`}
              key={p.uid}>
              <a>
                <h1>{p.data.title}</h1>
                <p>{p.data.subtitle}</p>
                <div className={commonStyles.info} >
                  <time ><FiCalendar />  {formatDate(p.first_publication_date)}</time>
                  <span> <FiUser /> {p.data.author}</span>
                </div>
              </a>
            </Link>

          )}
          {nextPage &&
            <button
              type="button"
              onClick={handleLoadMorePosts}
            >
              Carregar mais posts </button>
          }
        </div>
      </main>




    </>
  )

}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 2
  }
  );

  const posts = postsResponse.results.map((post: Post) => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      },
    }
  })
  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts || []
      }
    }
  }
};
