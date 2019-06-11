import React from 'react';
import {
  Card,
  ActionList,
  TopBar,
  Navigation,
  Modal,
  FormLayout,
  TextField,
  AppProvider,
  SkeletonBodyText,
  Layout,
  TextContainer,
  SkeletonDisplayText,
  Frame,
  Toast,
  ContextualSaveBar,
  Loading,
  Page,
  SkeletonPage,
  ResourceList,
  Button,
} from '@shopify/polaris';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getUser, logout } from '../../../modules/users';
import { getMyStocks } from '../../../modules/stock';
import { genList } from './genList';
import { LeftNavigation } from '../../SubContainers/LeftNavigation';
import { AddProduct } from '../ProdectDetail/addProduct';
import { theme } from '../../../utils/globals';

class Stock extends React.Component {
  constructor(props, context) {
    super(props);
    this.store = context.store;
    this.myInfo = this.state = {
      myInfo: this.store.getState().users,
      myStocks: [],
      showToast: false,
      isLoading: false,
      isDirty: false,
      searchActive: false,
      searchText: '',
      userMenuOpen: false,
      showMobileNavigation: false,
      modalActive: false,
      nameFieldValue: '',
      emailFieldValue: '',
      storeName: '',
      supportSubject: '',
      supportMessage: '',
    };
  }

  async componentWillReceiveProps(nextProps, nextContext) {
    // console.log('---------------update state');
    // console.log(nextContext.store.getState().users);
    const userInfo = nextContext.store.getState().users.user;
    await this.setState({
      myInfo: Object.assign({}, userInfo),
      nameFieldValue: userInfo.username,
      emailFieldValue: userInfo.email,
    });
    await this.updateStock();
  }

  static contextTypes = {
    router: PropTypes.object,
    store: PropTypes.object,
  };

  logout = async () => {
    const { logout } = this.props;
    await logout();
    const { router } = this.context;
    router.history.push('/login');
  };

  async updateStock() {
    const result = await getMyStocks(this.state.myInfo.userId);
    await this.setState({ myStocks: result });
  }

  async componentDidMount() {}

  render() {
    //console.log('store', this.context.store.getState());
    const {
      showToast,
      isLoading,
      isDirty,
      searchActive,
      searchText,
      userMenuOpen,
      showMobileNavigation,
      nameFieldValue,
      emailFieldValue,
      modalActive,
      storeName,
    } = this.state;

    const toastMarkup = showToast ? (
      <Toast
        onDismiss={this.toggleState('showToast')}
        content='Changes saved'
      />
    ) : null;

    const userMenuActions = [
      {
        items: [{ content: 'Sign Out', onAction: this.logout }],
      },
    ];

    const navigationUserMenuMarkup = (
      <Navigation.UserMenu
        actions={userMenuActions}
        name={nameFieldValue}
        detail={storeName}
        avatarInitials={nameFieldValue.charAt(0).toUpperCase()}
      />
    );

    const contextualSaveBarMarkup = isDirty ? (
      <ContextualSaveBar
        message='Unsaved changes'
        saveAction={{
          onAction: this.handleSave,
        }}
        discardAction={{
          onAction: this.handleDiscard,
        }}
      />
    ) : null;

    const userMenuMarkup = (
      <TopBar.UserMenu
        actions={userMenuActions}
        name={nameFieldValue}
        detail={storeName}
        initials={nameFieldValue.charAt(0).toUpperCase()}
        open={userMenuOpen}
        onToggle={this.toggleState('userMenuOpen')}
      />
    );

    const searchResultsMarkup = (
      <Card>
        <ActionList
          items={[
            { content: 'Shopify help center' },
            { content: 'Community forums' },
          ]}
        />
      </Card>
    );

    const searchFieldMarkup = (
      <TopBar.SearchField
        onChange={this.handleSearchFieldChange}
        value={searchText}
        placeholder='Search'
      />
    );

    const topBarMarkup = (
      <TopBar
        showNavigationToggle={true}
        userMenu={userMenuMarkup}
        searchResultsVisible={searchActive}
        searchField={searchFieldMarkup}
        searchResults={searchResultsMarkup}
        onSearchResultsDismiss={this.handleSearchResultsDismiss}
        onNavigationToggle={this.toggleState('showMobileNavigation')}
      />
    );

    const navigationMarkup = <LeftNavigation toggleState={this.toggleState} />;

    const loadingMarkup = isLoading ? <Loading /> : null;

    const actualPageMarkup = (
      <Page title='Stock'>
        <Layout>
          <Layout.Section>
            <AddProduct action='ADD' ownerId={this.state.myInfo.userId} />
            <Card sectioned>
              <ResourceList
                resourceName={{ singular: 'My item', plural: 'My items' }}
                items={this.state.myStocks}
                renderItem={genList}
              />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );

    const loadingPageMarkup = (
      <SkeletonPage>
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <TextContainer>
                <SkeletonDisplayText size='small' />
                <SkeletonBodyText lines={9} />
              </TextContainer>
            </Card>
          </Layout.Section>
        </Layout>
      </SkeletonPage>
    );

    const pageMarkup = isLoading ? loadingPageMarkup : actualPageMarkup;

    const modalMarkup = (
      <Modal
        open={modalActive}
        onClose={this.toggleState('modalActive')}
        title='Contact support'
        primaryAction={{
          content: 'Send',
          onAction: this.toggleState('modalActive'),
        }}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label='Subject'
              value={this.state.supportSubject}
              onChange={this.handleSubjectChange}
            />
            <TextField
              label='Message'
              value={this.state.supportMessage}
              onChange={this.handleMessageChange}
              multiline
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    );

    return (
      <div style={{ height: '500px' }}>
        <AppProvider theme={theme}>
          <Frame
            topBar={topBarMarkup}
            navigation={navigationMarkup}
            showMobileNavigation={showMobileNavigation}
            onNavigationDismiss={this.toggleState('showMobileNavigation')}
          >
            {contextualSaveBarMarkup}
            {loadingMarkup}
            {pageMarkup}
            {toastMarkup}
            {modalMarkup}
          </Frame>
        </AppProvider>
      </div>
    );
  }

  toggleState = key => {
    return () => {
      this.setState(prevState => ({ [key]: !prevState[key] }));
    };
  };

  handleSearchFieldChange = value => {
    this.setState({ searchText: value });
    if (value.length > 0) {
      this.setState({ searchActive: true });
    } else {
      this.setState({ searchActive: false });
    }
  };

  handleSearchResultsDismiss = () => {
    this.setState(() => {
      return {
        searchActive: false,
        searchText: '',
      };
    });
  };

  handleEmailFieldChange = emailFieldValue => {
    this.setState({ emailFieldValue });
    if (emailFieldValue != '') {
      this.setState({ isDirty: true });
    }
  };

  handleNameFieldChange = nameFieldValue => {
    this.setState({ nameFieldValue });
    if (nameFieldValue != '') {
      this.setState({ isDirty: true });
    }
  };

  handleSave = () => {
    this.defaultState.nameFieldValue = this.state.nameFieldValue;
    this.defaultState.emailFieldValue = this.state.emailFieldValue;

    this.setState({
      isDirty: false,
      showToast: true,
      storeName: this.defaultState.nameFieldValue,
    });
  };

  handleDiscard = () => {
    this.setState({
      emailFieldValue: this.defaultState.emailFieldValue,
      nameFieldValue: this.defaultState.nameFieldValue,
      isDirty: false,
    });
  };

  handleSubjectChange = supportSubject => {
    this.setState({ supportSubject });
  };

  handleMessageChange = supportMessage => {
    this.setState({ supportMessage });
  };
}

export default connect(
  state => ({
    user: getUser(state),
  }),
  { logout }
)(Stock);
