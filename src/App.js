import React from 'react';
import './App.css';
import {
  languages,
  fetchRepositories
} from '@huchenme/github-trending';
import { Button, Image, Segment, Header, Dropdown, Divider, Dimmer, Loader, Container, Card, Icon, Label} from "semantic-ui-react";
import 'semantic-ui-css/semantic.min.css'
import {Blockstack, useBlockstack} from './useStack'

function App() {
  const [repos, setRepos] = React.useState([]);
  const [lang, setLang] = React.useState(null);
  const [myRepos, setMyRepos] = React.useState([]);
  const [langsDrop, setLangsDrop] = React.useState(null);
  const [period, setPeriod] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [ session, { login, logout, putFile, getFile } ] = useBlockstack();

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
    const mapToLanguages = ({ name }) => ({ key: name, text: name, value: name });
    let tmpLanguages = languages.map(mapToLanguages);
    setLangsDrop(tmpLanguages);
    if(session) {
      getFile('myRepos').then(response => {
        let tmpRepos = response;
        if(tmpRepos){
          setMyRepos(JSON.parse(tmpRepos));
        };
      });
    }
  }, [getFile, session]);
  
  React.useEffect(() => {
    setLoading(true);
    fetchRepositories({language: lang, period: period}).then(repositories => {
      console.log(repositories);
      setRepos([...repositories]);
    }).catch(e => {
      console.warn(e);
    }).finally(() => {
      setLoading(false);
    });
  }, [lang, period]);

  const addToFavourite = React.useCallback((repo) => {
    console.warn('repo', repo);
    let tmpRepos = [...myRepos];
    console.warn(tmpRepos);
    tmpRepos.push(repo);
    setMyRepos(tmpRepos);
    putFile('myRepos', JSON.stringify(tmpRepos)).then(response => {
      tmpRepos = [...repos].filter(myrepo => myrepo.name !== repo.name);
      setRepos(tmpRepos);
    });

  }, [myRepos, setMyRepos, repos, putFile]);

  const removeFromFavourite = React.useCallback((repo) => {
    console.warn('tmprepos before', repos);
    let tmpRepos=[...repos].filter(tmprepo => tmprepo.name !== repo.name);
    tmpRepos.push(repo);
    console.warn('tmprepos', tmpRepos);
    setRepos(tmpRepos);
    let tmpMyRepos = [...myRepos].filter(myrepo => myrepo.name !== repo.name);
    putFile('myRepos', JSON.stringify(tmpMyRepos)).then(response => {
      setMyRepos(tmpMyRepos);
    });
  },[myRepos, repos, putFile]);

  const renderRepos = React.useCallback(() => {
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
          {session ?
          <Button basic color='green'
            onClick={() => addToFavourite(repo)}
          >
            Add to favourite
          </Button> : <Label color="green">Please login to add to your favourite</Label>}
      </Card.Content>

      </Card>
      )
    });
    return tab;
  },[myRepos, repos, addToFavourite, session]);

  const renderMyRepos = React.useCallback(() => {
    let tab = [];
    myRepos.forEach(repo => {
      tab.push(
      <Card link
        color="red"
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
          <Button basic color='red'
            onClick={() => removeFromFavourite(repo)}
          >
            Remove from favourite
          </Button>
      </Card.Content>
      </Card>
      )
    });
    return tab;
  }, [myRepos, removeFromFavourite]);

  return (
    <Blockstack>
      <Container>
        <Header as='h1' icon textAlign='center'>
          <Icon name='github' circular />
          <Header.Content>What's the current trend in github today ? 
            {!session ? <Button floated="right" color="blue" onClick={login}>Login</Button> 
            :  <Button floated="right" color="red" onClick={logout}>Log out</Button>}
          </Header.Content>
        </Header>
        <Segment>
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
      <Header as='h2' icon textAlign='center'>
        <Icon name='favorite' circular />
        {myRepos.length ? <Header.Content>My saved repositories</Header.Content> :  <Header.Content>No repositories saved, start browsing !</Header.Content>}
      </Header>
      <Card.Group doubling itemsPerRow={5} stackable>
        {renderMyRepos()}
        </Card.Group>
        <Divider/>
        <Header as='h2' icon textAlign='center'>
        <Icon name='search' circular />
        {repos.length ? <Header.Content>Explore repositories</Header.Content> :  <Header.Content>No repos found, start a new search !</Header.Content> }
      </Header>
      {!loading && <Card.Group doubling itemsPerRow={5} stackable>
        {renderRepos()}
        </Card.Group>}
      </Container>
    </Blockstack>
  );

}

export default App;
