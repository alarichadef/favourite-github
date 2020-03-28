import React from 'react';
import './App.css';
import { Image, Segment, Header, Dropdown, Divider, Dimmer, Loader, Container, Card, Icon } from "semantic-ui-react";
import 'semantic-ui-css/semantic.min.css'
import Repository from './models/repository';
import Language from './models/language';
import SpokenLanguage from './models/spokenLanguage'



  function Repos({myRepos, repos}) {
    let tab = [];
    let tmpRepos = myRepos.map(repo => repo.name);
    repos.filter(repo =>
      !tmpRepos.includes(repo.name)
    ).forEach(repo => {
      tab.push(
      <Card link
        color="green"
      >
        <Card.Content
          onClick={()=> window.open(repo.url, "_blank")}
        >
          <Card.Header>
            {repo.name}
          </Card.Header>
          <Card.Meta>
            {repo.author}
          </Card.Meta>
          <Card.Description>
          <Image
            floated='right'
            size='mini'
            src={repo.avatar}
          />
            {repo.description}
          </Card.Description>
        </Card.Content>
        <Card.Content extra>
          <p>
            {repo.stars} <Icon name='star' color='yellow' disabled />
            {repo.forks} <Icon name='fork' color='black' disabled />
            <br/>{repo.language ? `Developped in ${repo.language}` : "No language related"}
          </p>
      </Card.Content>
        <Card.Content extra>
          {/* {session ?
          <Button basic color='green'
            onClick={() => addToFavourite(repo)}
          >
            Add to favourite
          </Button> : <Label color="green">Please login to add to your favourite</Label>} */}
      </Card.Content>

      </Card>
      )
    });
    return tab;
  };


function Github() {
  const [repos, setRepos] = React.useState([]);
  const [lang, setLang] = React.useState(null);
  const [myRepos, ] = React.useState([]);
  const [langsDrop, setLangsDrop] = React.useState(null);
  const [spokenLang, setSpokenLang] = React.useState(null);
  const [spokenLangsDrop, setSpokenLangsDrop] = React.useState(null);
  const [period, setPeriod] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const session = null;
  const periodOptions = [
    {
      key : 'daily',
      text: 'daily',
      value: 'daily'
    },
    {
      key : 'weekly',
      text: 'weekly',
      value: 'weekly'
    },
    {
      key : 'monthly',
      text: 'monthly',
      value: 'monthly'
    }
  ];

  React.useEffect(() => {
    // const mapToLanguages = ({ name }) => ({ key: name, text: name, value: name });
    // let tmpLanguages = languages.map(mapToLanguages);
    // setLangsDrop(tmpLanguages);
    // if(session) {
    //   getFile('myRepos').then(response => {
    //     let tmpRepos = response;
    //     if(tmpRepos){
    //       setMyRepos(JSON.parse(tmpRepos));
    //     };
    //   });
    // }
  }, [ session]);

    React.useEffect(() => {
    setLoading(true);
    Repository.getAll({},{language: lang, period, spokenLanguage: spokenLang}).then(repositories => {
      setRepos([...repositories]);
    }).catch(e => {
      console.warn(e);
    }).finally(() => {
      setLoading(false);
    });
  }, [lang, period, spokenLang]);
  
  React.useEffect(() => {
    Promise.all([Language.getAll(), SpokenLanguage.getAll()]).then(([languages, spokenLangs]) => {
      setLangsDrop(languages.map(({ name }) => ({ key: name, text: name, value: name })));
      setSpokenLangsDrop(spokenLangs.map(({ code, language }) => ({ key: code, text: language, value: code })));
    }).catch(e => {
      console.warn(e);
    });
  }, []);

  // const addToFavourite = React.useCallback((repo) => {
  //   // let tmpRepos = [...myRepos];
  //   // tmpRepos.push(repo);
  //   // setMyRepos(tmpRepos);
  //   // putFile('myRepos', JSON.stringify(tmpRepos)).then(response => {
  //   //   tmpRepos = [...repos].filter(myrepo => myrepo.name !== repo.name);
  //   //   setRepos(tmpRepos);
  //   // });

  // }, [myRepos, setMyRepos, repos]);

  // const removeFromFavourite = React.useCallback((repo) => {
  //   // let tmpRepos=[...repos].filter(tmprepo => tmprepo.name !== repo.name);
  //   // tmpRepos.push(repo);
  //   // setRepos(tmpRepos);
  //   // let tmpMyRepos = [...myRepos].filter(myrepo => myrepo.name !== repo.name);
  //   // putFile('myRepos', JSON.stringify(tmpMyRepos)).then(response => {
  //   //   setMyRepos(tmpMyRepos);
  //   // });
  // },[myRepos, repos]);


  // const renderMyRepos = React.useCallback(() => {
  //   let tab = [];
  //   myRepos.forEach(repo => {
  //     tab.push(
  //     <Card link
  //       color="red"
  //     >
  //       <Card.Content
  //         onClick={()=> window.open(repo.url, "_blank")}
  //       >
  //         <Card.Header>
  //           {repo.name}
  //         </Card.Header>
  //         <Card.Meta>
  //           {repo.author}
  //         </Card.Meta>
  //         <Card.Description>
  //         <Image
  //           floated='right'
  //           size='mini'
  //           src={repo.avatar}
  //         />
  //           {repo.description}
  //         </Card.Description>
  //       </Card.Content>
  //       <Card.Content extra>
  //         <p>
  //           {repo.stars} <Icon name='star' color='yellow' disabled />
  //           {repo.forks} <Icon name='fork' color='black' disabled />
  //           <br/>{repo.language ? `Developped in ${repo.language}` : "No language related"}
  //         </p>
  //     </Card.Content>

  //       <Card.Content extra>
  //         <Button basic color='red'
  //           onClick={() => removeFromFavourite(repo)}
  //         >
  //           Remove from favourite
  //         </Button>
  //     </Card.Content>
  //     </Card>
  //     )
  //   });
  //   return tab;
  // }, [myRepos, removeFromFavourite]);

  return (
      <Container>
        <Header as='h1' icon textAlign='center'>
          <Icon name='github' circular />
          <Header.Content>What's the current trend in github today ?
            {/* {!session ? <Button floated="right" color="blue" onClick={() => {}}>Login</Button> 
            :  <Button floated="right" color="red" onClick={() => {}}>Log out</Button>} */}
          </Header.Content>
        </Header>
        <Segment>
          <Dropdown
            clearable
            fluid
            search
            options={spokenLangsDrop}
            selection
            value={spokenLang}
            onChange={(synth, data) => setSpokenLang(data.value)}
            placeholder="Pick a spoken language"
          />
          <Divider/>
          <Dropdown
              clearable
              fluid
              search
              options={langsDrop}
              selection
              value={lang}
              onChange={(synth, data) => setLang(data.value)}
              placeholder="Pick a language"
          />
          <Divider/>
          <Dropdown
              clearable
              fluid
              search
              options={periodOptions}
              selection
              value={period}
              onChange={(synth, data) => setPeriod(data.value)}
              placeholder="Pick a period"
          />
        </Segment>
      {loading && <Dimmer active inverted>
          <Loader>
              Loading ...
          </Loader>
      </Dimmer>}
      {/* <Header as='h2' icon textAlign='center'>
        <Icon name='favorite' circular />
        {myRepos.length ? <Header.Content>My saved repositories</Header.Content> :  <Header.Content>No repositories saved, start browsing !</Header.Content>}
      </Header>
      <Card.Group doubling itemsPerRow={5} stackable>
        {renderMyRepos()}
        </Card.Group>
        <Divider/> */}
        <Header as='h2' icon textAlign='center'>
        <Icon name='search' circular />
        {repos.length ? <Header.Content>Explore repositories</Header.Content> :  <Header.Content>No repos found, start a new search !</Header.Content> }
      </Header>
      {!loading && <Card.Group doubling itemsPerRow={5} stackable>
        <Repos
          repos={repos}
          myRepos={myRepos}
        />
        </Card.Group>}
      </Container>
  );

}

export default function App() {
  return (
    <Github/>
  );
}
